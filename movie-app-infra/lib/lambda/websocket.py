import json


def handler(event, context):
    print("upaoooo")
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }
