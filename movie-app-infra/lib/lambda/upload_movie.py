import boto3
import json
import os
import uuid
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
    actors = body['actors']
    movie_size = body['movie_size']
    genre = body['genre']
    duration = body['duration']
    director = body['director']
    image = body['image']

    movie_id = str(uuid.uuid4())
    created_at = datetime.utcnow().isoformat()
    updated_at = created_at

    s3_key = f"{movie_id}"

    # Generate presigned URL for uploading the file to S3
    try:
        presigned_url = s3.generate_presigned_url(
            'put_object',
            Params={'Bucket': movie_bucket, 'Key': s3_key},
            ExpiresIn=3600  # URL expiry time in seconds
        )
    except Exception as e:
        print(f"Error generating presigned URL: {e}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps({'error': 'Could not generate presigned URL'})
        }

    db_params = {
        'movieId': movie_id,
        'title': title,
        'description': description,
        'fileName': file_name,
        'actors': actors,
        'movie_size': movie_size,
        'genre': genre,
        'duration': duration,
        'director': director,
        's3Key': s3_key,
        'createdAt': created_at,
        'updatedAt': updated_at,
        'image': image
    }

    try:
        # Save movie metadata to DynamoDB
        print('Saving movie metadata to DynamoDB:', db_params)
        table.put_item(Item=db_params)
        print('Movie metadata saved to DynamoDB')

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps({
                'message': 'Presigned URL generated successfully',
                'presignedUrl': presigned_url,
                'movieId': movie_id
            })
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
