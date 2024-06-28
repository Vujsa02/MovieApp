import boto3
import os
import json
from botocore.exceptions import ClientError

s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')
movie_bucket = os.environ['MOVIE_BUCKET_NAME']
transcode_bucket = os.environ['TRANSCODE_BUCKET_NAME']
interactions_table = dynamodb.Table(os.environ['INTERACTIONS_TABLE_NAME'])


def lambda_handler(event, context):
    movie_id = event['pathParameters']['movieId']
    s3_key = f"{movie_id}"
    print(s3_key)

    if movie_id.endswith('-480p') or movie_id.endswith('-720p') or movie_id.endswith('-360p'):
        bucket_name = transcode_bucket
    else:
        bucket_name = movie_bucket
    print(bucket_name)
    info = json.loads(event['queryStringParameters']['info'])
    username = event['queryStringParameters']['username']
    print('User:', username)
    print('Info:', info)

    try:
        presigned_url = s3.generate_presigned_url('get_object', Params={'Bucket': bucket_name, 'Key': s3_key}, ExpiresIn=3600)

        response = interactions_table.get_item(Key={'userId': username})
        if 'Item' in response:
            interactions = response['Item']
            for key in info:
                if key in interactions:
                    interactions[key] += 1
                else:
                    interactions[key] = 1
            interactions_table.put_item(Item=interactions)
        else:
            interactions = {key: 1 for key in info}
            interactions['userId'] = username
            interactions_table.put_item(Item=interactions)

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps({'presigned_url': presigned_url})
        }
    except ClientError as e:
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps({'error': str(e)})
        }
