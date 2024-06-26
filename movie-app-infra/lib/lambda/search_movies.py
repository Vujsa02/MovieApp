import boto3
import json
import os

def query_dynamodb(title=None, director=None, genre=None, actors=None, description=None):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(os.environ['MOVIE_TABLE_NAME'])

    # Initialize base parameters
    params = {
        'TableName': os.environ['MOVIE_TABLE_NAME'],
    }

    # Build KeyConditionExpression and ExpressionAttributeValues dynamically
    key_condition_expression = ''
    filter_expressions = []
    expression_attribute_values = {}

    if title:
        params['IndexName'] = 'TitleIndex'
        key_condition_expression = 'title = :title'
        expression_attribute_values[':title'] = title

    if director:
        if key_condition_expression:
            filter_expressions.append('director = :director')
        else:
            params['IndexName'] = 'DirectorIndex'
            key_condition_expression = 'director = :director'
        expression_attribute_values[':director'] = director

    if description:
        if key_condition_expression:
            filter_expressions.append('contains(description, :description)')
        else:
            params['IndexName'] = 'DescriptionIndex'
            key_condition_expression = 'description = :description'
        expression_attribute_values[':description'] = description

    if not key_condition_expression and not filter_expressions:
        if genre:
            items = query_movies_by_genre(genre)
            if actors:
                items = [item for item in items if actors in item['actors']]
                return items
        elif actors:
            items = query_movies_by_actor(actors)
            if genre:
                items = [item for item in items if genre in item['genre']]
                return items
        raise ValueError("At least one search criteria must be provided.")

    if key_condition_expression:
        params['KeyConditionExpression'] = key_condition_expression
        params['ExpressionAttributeValues'] = expression_attribute_values

    if filter_expressions:
        params['FilterExpression'] = ' AND '.join(filter_expressions)

    # Perform DynamoDB query
    response = table.query(**params)
    items = response['Items']
    if genre:
        items = [item for item in items if genre in item['genre']]
    if actors:
        items = [item for item in items if actors in item['actors']]
    return items

def query_movies_by_genre(genre):
    dynamodb = boto3.resource('dynamodb')
    genres_table = dynamodb.Table(os.environ['GENRES_TABLE_NAME'])
    response = genres_table.query(
        IndexName='genre-index',
        KeyConditionExpression='genre = :genre',
        ExpressionAttributeValues={
            ':genre': genre,
        }
    )
    movie_id_timestamps = [(item['movieId'], item['createdAt']) for item in response['Items']]
    return get_movies_by_ids(movie_id_timestamps)


def query_movies_by_actor(actor):
    dynamodb = boto3.resource('dynamodb')
    actors_table = dynamodb.Table(os.environ['ACTORS_TABLE_NAME'])
    response = actors_table.query(
        IndexName='actor-index',
        KeyConditionExpression='actor = :actor',
        ExpressionAttributeValues={
            ':actor': actor,
        }
    )
    print(response['Items'])
    movie_id_timestamps = [(item['movieId'], item['createdAt']) for item in response['Items']]
    return get_movies_by_ids(movie_id_timestamps)


def get_movies_by_ids(movie_id_timestamps):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(os.environ['MOVIE_TABLE_NAME'])
    items = []
    print(movie_id_timestamps)
    for movie_id, created_at in movie_id_timestamps:
        print(movie_id, created_at)
        response = table.get_item(Key={'movieId': movie_id, 'createdAt': created_at})
        if 'Item' in response:
            items.append(response['Item'])
    print(items)
    return items

def lambda_handler(event, context):
    try:
        # Parse parameters from request body
        body = json.loads(event['body'])
        title = body.get('title')
        director = body.get('director')
        genre = body.get('genre')
        actors = body.get('actors')
        description = body.get('description')

        # Query DynamoDB using the global secondary index
        items = query_dynamodb(title=title, director=director, genre=genre, actors=actors, description=description)

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps(items),
        }
    except Exception as e:
        print(f"Error querying DynamoDB: {e}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps({'message': 'Error querying DynamoDB'}),
        }
