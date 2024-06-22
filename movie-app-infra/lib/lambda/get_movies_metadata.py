import boto3
import os
import json
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb')
movie_table = dynamodb.Table(os.environ['MOVIE_TABLE_NAME'])

def lambda_handler(event, context):
    try:
        response = movie_table.scan()
        movies = response.get('Items', [])

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps(movies)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
