import json
import os

import boto3

dynamodb = boto3.resource('dynamodb')
user_feed_table = dynamodb.Table(os.environ['USER_FEED_TABLE_NAME'])


def lambda_handler(event, context):
    for record in event['Records']:
        if record['eventName'] == 'INSERT' or record['eventName'] == 'MODIFY':
            new_image = record['dynamodb']['NewImage']
            user_id = new_image['userId']['S']
            # Extract the attributes you need
            attributes = {k: int(v['N']) for k, v in new_image.items() if k not in ['userId']}

            # Update the userFeedTable
            user_feed_table.update_item(
                Key={'userId': user_id},
                UpdateExpression='SET ' + ', '.join(f'#{k} = :{k}' for k in attributes.keys()),
                ExpressionAttributeNames={f'#{k}': k for k in attributes.keys()},
                ExpressionAttributeValues={f':{k}': v for k, v in attributes.items()}
            )
    return {
        'statusCode': 200,
        'body': json.dumps('Successfully processed records')
    }
