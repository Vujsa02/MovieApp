import boto3
import os
import json

from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb')
movie_table = dynamodb.Table(os.environ['MOVIE_TABLE_NAME'])


def lambda_handler(event, context):
    try:
        movie_id = event['pathParameters']['movieId']
        print("Movie id: ", movie_id)
        created_at = event['queryStringParameters'].get('createdAt')  # Assuming createdAt is passed as query parameter

        # Construct KeyConditionExpression based on movieId and optional createdAt
        key_condition = Key('movieId').eq(movie_id)
        if created_at:
            key_condition = key_condition & Key('createdAt').eq(created_at)

        # Query DynamoDB table
        response = movie_table.query(
            KeyConditionExpression=key_condition
        )

        if 'Items' not in response:
            return {
                'statusCode': 404,
                'headers': {
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                },
                'body': json.dumps({'error': 'Movie not found', "response:": response})
            }

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,GET'
            },
            'body': json.dumps(response['Items'])
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps({'error': str(e)})
        }
