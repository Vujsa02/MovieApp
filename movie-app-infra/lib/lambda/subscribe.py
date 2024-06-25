import json
import os

import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['SUBSCRIPTION_TABLE_NAME'])


# table saves user emails and the list of strings they are subscribed to
def lambda_handler(event, context):
    body = json.loads(event['body'])
    email = body['email']
    subscriptions = body['subscriptions']

    # Validate the subscriptions
    if not all(isinstance(sub, str) for sub in subscriptions):
        return {
            'statusCode': 400,
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps({'error': 'Invalid subscription value. Must be a list of strings.'})
        }

    db_params = {
        'email': email,
        'subscriptions': subscriptions
    }

    try:
        # Save subscription to DynamoDB
        print('Saving subscription to DynamoDB:', db_params)
        table.put_item(
            Item=db_params,
            ConditionExpression="attribute_not_exists(email) OR email = :email",
            ExpressionAttributeValues={':email': email}
        )
        print('Subscription saved to DynamoDB')

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps({
                'message': 'Subscription added successfully',
                'email': email
            })
        }
    except Exception as e:
        print('Error saving subscription to DynamoDB:', e)
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps({'error': 'Could not save subscription to DynamoDB'})
        }
