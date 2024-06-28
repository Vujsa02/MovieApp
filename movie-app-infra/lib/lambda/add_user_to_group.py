import json
import boto3

def lambda_handler(event, context):
    body = json.loads(event['body'])
    user_pool_id = body['poolId']
    username = body['userName']
    group_name = body['group_name']

    client = boto3.client('cognito-idp')

    response = client.admin_add_user_to_group(
        UserPoolId=user_pool_id,
        Username=username,
        GroupName=group_name
    )

    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
        'body': json.dumps('User added to group successfully')
    }
