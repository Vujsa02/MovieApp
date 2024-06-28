import json
import os

import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['SUBSCRIPTION_TABLE_NAME'])


def lambda_handler(event, context):
    email = event['queryStringParameters']['email']
    print('Email:', email)
    response = table.get_item(Key={'email': email})
    if 'Item' in response:
        item = response['Item']
        print('Item:', item)
        subscriptions = item['subscriptions']
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps(subscriptions)
        }
    else:
        return {
            'statusCode': 404,
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': 'Subscription not found'
        }
