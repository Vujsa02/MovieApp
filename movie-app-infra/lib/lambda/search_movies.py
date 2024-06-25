import boto3
import json
import os

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['MOVIE_TABLE_NAME'])

def create_composite_key(title, director, actors, description, genre):
    # Create a composite key based on provided attributes
    default_title = title or '*'
    default_director = director or '*'
    default_actors = actors or '*'
    default_description = description or '*'
    default_genre = genre or '*'
    return f"{default_title}#{default_director}#{default_actors}#{default_description}#{default_genre}"

def lambda_handler(event, context):
    try:
        # Parse query parameters from event
        title = event['queryStringParameters'].get('title')
        director = event['queryStringParameters'].get('director')
        actors = event['queryStringParameters'].get('actors')
        description = event['queryStringParameters'].get('description')
        genre = event['queryStringParameters'].get('genre')

        # Create composite key
        composite_key = create_composite_key(title, director, actors, description, genre)

        # Query DynamoDB using the global secondary index
        params = {
            'TableName': os.environ['MOVIE_TABLE_NAME'],
            'IndexName': os.environ['MOVIE_TABLE_GSI_NAME'],
            'KeyConditionExpression': 'compositeKey = :key',
            'ExpressionAttributeValues': {
                ':key': composite_key,
            },
        }

        # Perform DynamoDB query
        response = table.query(**params)

        return {
            'statusCode': 200,
            'body': json.dumps(response['Items']),
        }
    except Exception as e:
        print(f"Error querying DynamoDB: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Error querying DynamoDB'}),
        }