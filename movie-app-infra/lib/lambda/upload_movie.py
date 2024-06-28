import json
import os
import uuid
from datetime import datetime

import boto3

s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')

movie_bucket = os.environ['MOVIE_BUCKET_NAME']
movie_table_name = os.environ['MOVIE_TABLE_NAME']
genres_table_name = os.environ['GENRES_TABLE_NAME']
actors_table_name = os.environ['ACTORS_TABLE_NAME']
subscription_table_name = os.environ['SUBSCRIPTION_TABLE_NAME']
email_queue_url = os.environ['EMAIL_QUEUE_URL']
interactions_table_name = os.environ['INTERACTIONS_TABLE_NAME']

table = dynamodb.Table(movie_table_name)
genres_table = dynamodb.Table(genres_table_name)
actors_table = dynamodb.Table(actors_table_name)
subscription_table = dynamodb.Table(subscription_table_name)
interactions_table = dynamodb.Table(interactions_table_name)
sqs = boto3.client('sqs')

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
        print('SeriesId:', seriesId)
        print('EpisodeNumber:', episodeNumber)

        if episodeNumber != '0':
            response = table.query(
                IndexName='SeriesIdIndex',  # Use the existing GSI named 'SeriesIdIndex'
                KeyConditionExpression='seriesId = :seriesId',
                ExpressionAttributeValues={
                    ':seriesId': seriesId
                }
            )

            print('Response:', response['Items'])

            # Check if any item has the same episodeNumber
            for item in response['Items']:
                if item['episodeNumber'] == episodeNumber:
                    return {
                        'statusCode': 400,
                        'headers': {
                            'Access-Control-Allow-Headers': 'Content-Type',
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                        },
                        'body': json.dumps({'error': 'Item with the same seriesId and episodeNumber already exists'})
                    }

        movie_id = str(uuid.uuid4())
        created_at = datetime.utcnow().isoformat()
        updated_at = created_at

        s3_key = f"{movie_id}"

        if body['content']:
            presigned_url = s3.generate_presigned_url(
                'put_object',
                Params={'Bucket': movie_bucket, 'Key': s3_key},
                ExpiresIn=3600
            )
        else:
            presigned_url = ''

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
            'image': image,
            'episodeNumber': episodeNumber,
            'seriesId': seriesId
        }

        # Save movie metadata to DynamoDB
        table.put_item(Item=db_params)

        for genr in genre:
            genres_table.put_item(Item={
                'movieId': movie_id,
                'genre': genr,
                'createdAt': created_at
            })

        for actor in actors:
            actors_table.put_item(Item={
                'movieId': movie_id,
                'actor': actor,
                'createdAt': created_at
            })

        # Get all subscriptions from the subscription table
        response = subscription_table.scan()
        subscriptions = response['Items']

        # add actors, director, and genre to the match list
        match_list = actors + [director] + genre
        for subscription in subscriptions:
            # Check if any of the subscriptions match the movie metadata
            if any(sub in match_list for sub in subscription.get('subscriptions', [])):
                # Send an email to the user
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

        # add user 'mika' to the interactions table
        data = interactions_table.scan()
        # add column to every user in interactions table
        for item in data['Items']:
            item['krmadija'] = 0
            interactions_table.put_item(Item=item)
        for item in data['Items']:
            item.pop('krmadija', None)
            interactions_table.put_item(Item=item)


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
