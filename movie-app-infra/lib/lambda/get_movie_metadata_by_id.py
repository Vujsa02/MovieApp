import boto3
import os
import json

dynamodb = boto3.resource('dynamodb')
movie_table = dynamodb.Table(os.environ['MOVIE_TABLE_NAME'])


def lambda_handler(event, context):
    try:
        movie_id = event['pathParameters']['movieId']
        response = movie_table.get_item(Key={'movieId': movie_id})

        if 'Item' not in response:
            return {
                'statusCode': 404,
                'body': json.dumps({'error': 'Movie not found'})
            }

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,GET'
            },
            'body': json.dumps(response['Item'])
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
