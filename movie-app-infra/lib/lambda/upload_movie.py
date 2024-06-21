import boto3
import json
import os
import uuid
import base64
from datetime import datetime

s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')
movie_bucket = os.environ['MOVIE_BUCKET_NAME']
movie_table = os.environ['MOVIE_TABLE_NAME']
table = dynamodb.Table(movie_table)


def lambda_handler(event, context):
    body = json.loads(event['body'])
    title = body['title']
    description = body['description']
    file_name = body['fileName']
    file_content = body['fileContent']

    movie_id = str(uuid.uuid4())
    created_at = datetime.utcnow().isoformat()

    s3_key = f"{movie_id}/{file_name}"

    # Ensure the base64 encoded string has correct padding
    file_content += '=' * (-len(file_content) % 4)

    try:
        # Decode the base64 string to get the original binary content
        decoded_file_content = base64.b64decode(file_content)
    except Exception as e:
        print(f"Error decoding base64 content: {e}")
        return {
            'statusCode': 400,
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps({'error': 'Invalid base64 content'})
        }

    s3_params = {
        'Bucket': movie_bucket,
        'Key': s3_key,
        'Body': decoded_file_content
    }

    db_params = {
        'movieId': movie_id,
        'title': title,
        'description': description,
        'fileName': file_name,
        'createdAt': created_at
    }

    try:
        print('Uploading file to S3:', s3_params)
        s3.put_object(**s3_params)
        print('File uploaded successfully to S3')

        print('Saving movie metadata to DynamoDB:', db_params)
        table.put_item(Item=db_params)
        print('Movie metadata saved to DynamoDB')

        return {
            'statusCode': 201,
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps({'message': 'Movie uploaded successfully'})
        }
    except Exception as e:
        print(f"Error: {e}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps({'error': str(e)})
        }
