import boto3
import json
import os
from datetime import datetime

s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')
movie_bucket = os.environ['MOVIE_BUCKET_NAME']
movie_table = os.environ['MOVIE_TABLE_NAME']
table = dynamodb.Table(movie_table)

def create_composite_key(title, director, actors, description, genre):
    return f"{title}#{director}#{actors}#{description}#{genre}"

def lambda_handler(event, context):
    try:
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
        episodeNumber = body['episodeNumber']
        seriesId = body['seriesId']

        movie_id = event['pathParameters']['movieId']
        created_at = event['queryStringParameters'].get('createdAt')

        updated_at = datetime.utcnow().isoformat()

        s3_key = f"{movie_id}"

        if body['content'] == "":
            presigned_url = ''
        else:
            presigned_url = s3.generate_presigned_url(
                'put_object',
                Params={'Bucket': movie_bucket, 'Key': s3_key},
                ExpiresIn=3600
            )
        composite_key = create_composite_key(title, director, actors, description, genre)

        db_params = {
            'movieId': movie_id,
            'createdAt': created_at,
            'title': title,
            'description': description,
            'fileName': file_name,
            'actors': actors,
            'movie_size': movie_size,
            'genre': genre,
            'duration': duration,
            'director': director,
            's3Key': s3_key,
            'updatedAt': updated_at,
            'image': image,
            'episodeNumber': episodeNumber,
            'seriesId': seriesId
        }

        # Use put_item to replace the item
        table.put_item(Item=db_params)

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
