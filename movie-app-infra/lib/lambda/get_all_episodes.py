import boto3
import os
import json

from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb')
movie_table = dynamodb.Table(os.environ['MOVIE_TABLE_NAME'])

def lambda_handler(event, context):
    try:
        series_id = event['pathParameters']['seriesId']

        # Query DynamoDB table using the GSI for seriesId
        response = movie_table.query(
            IndexName='SeriesIdIndex',  # Using the GSI index name
            KeyConditionExpression=Key('seriesId').eq(series_id)
        )

        if 'Items' not in response or len(response['Items']) == 0:
            return {
                'statusCode': 404,
                'headers': {
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'OPTIONS,GET'
                },
                'body': json.dumps({'error': 'No movies found for the given seriesId'})
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
                'Access-Control-Allow-Methods': 'OPTIONS,GET'
            },
            'body': json.dumps({'error': str(e)})
        }
