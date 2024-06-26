import json
import boto3
import os

ses = boto3.client('ses')
sqs = boto3.client('sqs')

SENDER = os.environ['SENDER_EMAIL']
QUEUE_URL = os.environ['EMAIL_QUEUE_URL']


def lambda_handler(event, context):
    for record in event['Records']:
        message_body = json.loads(record['body'])
        recipient = message_body['email']
        subject = message_body.get('subject', 'New Movie Notification')
        body_text = message_body.get('body_text', 'A new movie has been added.')
        body_html = message_body.get('body_html', '<p>A new movie has been added.</p>')

        try:
            response = ses.send_email(
                Source=SENDER,
                Destination={'ToAddresses': [recipient]},
                Message={
                    'Subject': {'Data': subject},
                    'Body': {
                        'Text': {'Data': body_text},
                        'Html': {'Data': body_html}
                    }
                }
            )
        except Exception as e:
            print(f"Error sending email to {recipient}: {e}")
            raise e

        try:
            sqs.delete_message(
                QueueUrl=QUEUE_URL,
                ReceiptHandle=record['receiptHandle']
            )
        except Exception as e:
            print(f"Error deleting message from SQS: {e}")
            raise e

    return {
        'statusCode': 200,
        'body': json.dumps('Email sent successfully')
    }
