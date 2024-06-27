import json
import os

import boto3
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb')
user_interactions_table = dynamodb.Table(os.environ['USER_INTERACTIONS_TABLE_NAME'])
user_feed_table = dynamodb.Table(os.environ['USER_FEED_TABLE_NAME'])
movie_table = dynamodb.Table(os.environ['MOVIE_TABLE_NAME'])
topic_arn = os.environ['SNS_TOPIC_ARN']
sns = boto3.client('sns')


def lambda_handler(event, context):
    # Process each record in the DynamoDB event
    for record in event['Records']:
        print('Record:', record)
        if record['eventName'] == 'INSERT' or record['eventName'] == 'MODIFY':
            user_id = record['dynamodb']['Keys']['userId']['S']
            update_user_feed(user_id)


def scan_table(table_name):
    response = table_name.scan()
    items = response.get('Items', [])
    while 'LastEvaluatedKey' in response:
        response = table_name.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
        items.extend(response['Items'])
    return {'Items': items}


# def publish_to_sns(user_id):
#     sns.publish(
#         TopicArn=topic_arn,
#         Message=json.dumps({'userId': user_id}),
#         MessageStructure='string'
#     )


def update_user_feed(user_id):
    # Get user interactions
    print('Updating feed for user:', user_id)
    response = user_interactions_table.get_item(Key={'userId': user_id})
    if 'Item' not in response:
        return

    interactions = response['Item']
    # Remove non-relevant fields
    interactions.pop('userId', None)

    # Get all movies
    movies = scan_table(movie_table)
    if 'Items' not in movies:
        return

    # Initialize the feed for the user
    feed = {}
    for movie in movies['Items']:
        movie_id = movie['movieId']
        feed[movie_id] = calculate_movie_score(movie, interactions)

    # Sort the feed by score
    feed = {k: v for k, v in sorted(feed.items(), key=lambda item: item[1], reverse=True)}

    # publish_to_sns(user_id)

    # Update user feed table
    user_feed_table.put_item(
        Item={
            'userId': user_id,
            **feed
        }
    )


def calculate_movie_score(movie, interactions):
    score = 0
    attributes = movie.get('genre', []) + movie.get('actors', []) + [movie.get('director')]
    print('Attributes:', attributes)
    print('Interactions:', interactions)
    for attr in attributes:
        if attr in interactions:
            score += interactions[attr]
    return score
