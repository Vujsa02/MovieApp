import boto3
import json
import os
import uuid
from datetime import datetime

s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')
movie_bucket = os.environ['MOVIE_BUCKET_NAME']
movie_table = os.environ['MOVIE_TABLE_NAME']
subscription_table = os.environ['SUBSCRIPTION_TABLE_NAME']
table = dynamodb.Table(movie_table)
subscription_table = dynamodb.Table(subscription_table)
sqs = boto3.client('sqs')
email_queue_url = os.environ['EMAIL_QUEUE_URL']


def create_composite_key(title, director, actors, description, genre):
    # Create a composite key based on provided attributes
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

        movie_id = str(uuid.uuid4())
        created_at = datetime.utcnow().isoformat()
        updated_at = created_at

        s3_key = f"{movie_id}"

        # Generate presigned URL for uploading the file to S3
        presigned_url = s3.generate_presigned_url(
            'put_object',
            Params={'Bucket': movie_bucket, 'Key': s3_key},
            ExpiresIn=3600  # URL expiry time in seconds
        )

        # Create composite key for DynamoDB
        composite_key = create_composite_key(title, director, actors, description, genre)

        db_params = {
            'movieId': movie_id,
            'compositeKey': composite_key,
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

        # Save movie metadata to DynamoDB
        table.put_item(Item=db_params)

        # Get all subscriptions from the subscription table
        response = subscription_table.scan()
        subscriptions = response['Items']

        # add actors, director, and genre to the match list
        match_list = actors + [director] + [genre]
        for subscription in subscriptions:
            # Check if any of the subscriptions match the movie metadata
            if any(sub in match_list for sub in subscription['subscriptions']):
                # Send an email to the user
                print(image)
                message = {
                    'email': subscription['email'],
                    'subject': f"New Movie: {title}",
                    'body_text': f"Check out the new movie: {title}. \n\n Short Description: {description}",
                    'body_html': f"""
                        <p>Check out the new movie: <strong>{title}</strong>.</p>
                        <p>Short Description: {description}</p>
                    """
                }
                sqs.send_message(
                    QueueUrl=email_queue_url,
                    MessageBody=json.dumps(message)
                )

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
