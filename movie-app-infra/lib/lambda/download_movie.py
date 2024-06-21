import boto3
import os
import json
from botocore.exceptions import ClientError

s3 = boto3.client('s3')
movie_bucket = os.environ['MOVIE_BUCKET_NAME']

def lambda_handler(event, context):
    movie_id = event['queryStringParameters']['movieId']
    file_name = event['queryStringParameters']['fileName']

    s3_key = f"{movie_id}/{file_name}"

    s3_params = {
        'Bucket': movie_bucket,
        'Key': s3_key
    }

    try:
        data = s3.get_object(**s3_params)
        file_content = data['Body'].read()
        content_type = data['ContentType']

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': content_type,
                'Content-Disposition': f'attachment; filename="{file_name}"',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': file_content.decode('base64'),
            'isBase64Encoded': True
        }
    except ClientError as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
