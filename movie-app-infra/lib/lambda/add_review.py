import boto3
import json
import os
import uuid
from datetime import datetime

dynamodb = boto3.resource('dynamodb')
review_table = os.environ['REVIEW_TABLE_NAME']
table = dynamodb.Table(review_table)

def lambda_handler(event, context):
    body = json.loads(event['body'])
    movie_id = body['movieId']
    user_id = body['userId']
    rating = body['rating']  # Expecting "like", "love", or "dislike"

    # Validate the rating
    if rating not in ['like', 'love', 'dislike']:
        return {
            'statusCode': 400,
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps({'error': 'Invalid rating value. Must be like, love, or dislike.'})
        }

    review_id = str(uuid.uuid4())
    created_at = datetime.utcnow().isoformat()
    updated_at = created_at

    db_params = {
        'reviewId': review_id,
        'movieId': movie_id,
        'userId': user_id,
        'rating': rating,
        'createdAt': created_at,
        'updatedAt': updated_at,
    }

    try:
        # Save review to DynamoDB
        print('Saving review to DynamoDB:', db_params)
        table.put_item(Item=db_params)
        print('Review saved to DynamoDB')

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps({
                'message': 'Review added successfully',
                'reviewId': review_id
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
