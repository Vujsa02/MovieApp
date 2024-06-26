import boto3
import json
import os

from boto3.dynamodb.conditions import Key

s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')
movie_bucket = os.environ['MOVIE_BUCKET_NAME']
movie_table = dynamodb.Table(os.environ['MOVIE_TABLE_NAME'])

def lambda_handler(event, context):
    try:
        movie_id = event['pathParameters']['movieId']
        created_at = event['queryStringParameters'].get('createdAt')
        print(f"Movie id: {movie_id}, Created at: {created_at}")

        # Construct KeyConditionExpression based on movieId and createdAt
        key_condition = Key('movieId').eq(movie_id) & Key('createdAt').eq(created_at)

        # Query DynamoDB table to retrieve the item
        response = movie_table.query(
            KeyConditionExpression=key_condition
        )

        if 'Items' not in response or len(response['Items']) == 0:
            return {
                'statusCode': 404,
                'headers': {
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,DELETE'
                },
                'body': json.dumps({'error': 'Movie not found'})
            }

        movie_item = response['Items'][0]
        s3_key = movie_item['s3Key']

        # Delete movie file from S3
        s3.delete_object(Bucket=movie_bucket, Key=s3_key)

        # Delete movie metadata from DynamoDB
        movie_table.delete_item(
            Key={
                'movieId': movie_id,
                'createdAt': created_at
            }
        )

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,DELETE'
            },
            'body': json.dumps({'message': 'Movie deleted successfully'})
        }
    except Exception as e:
        print(f"Error: {e}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,DELETE'
            },
            'body': json.dumps({'error': str(e)})
        }
