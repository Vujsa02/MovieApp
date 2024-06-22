import boto3
import os
import json
from botocore.exceptions import ClientError

s3 = boto3.client('s3')
movie_bucket = os.environ['MOVIE_BUCKET_NAME']

def lambda_handler(event, context):
    movie_id = event['pathParameters']['movieId']

    s3_key = movie_id

    try:
        presigned_url = s3.generate_presigned_url('get_object', Params={'Bucket': movie_bucket, 'Key': s3_key}, ExpiresIn=3600)

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
            'body': json.dumps({'error': str(e)})
        }
