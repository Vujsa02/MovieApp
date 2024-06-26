import boto3
import os
import json

dynamodb = boto3.resource('dynamodb')
movie_table = dynamodb.Table(os.environ['MOVIE_TABLE_NAME'])
feed_table = dynamodb.Table(os.environ['FEED_TABLE_NAME'])


def scan_table(table_name):
    response = table_name.scan()
    items = response.get('Items', [])
    while 'LastEvaluatedKey' in response:
        response = table_name.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
        items.extend(response['Items'])
    return items



def lambda_handler(event, context):
    try:
        username = event['queryStringParameters']['username']
        movies = scan_table(movie_table)
        if not username:
            movies = scan_table(movie_table)
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                },
                'body': json.dumps(movies)
            }
        # get user feed
        response = feed_table.get_item(Key={'userId': username})
        if 'Item' in response:
            feed = response['Item']
        else:
            feed = {'userId': username}

        feed.pop('userId', None)

        # sort feed by value
        sorted_feed = dict(sorted(feed.items(), key=lambda item: item[1], reverse=True))
        sorted_movies = []
        for sf in sorted_feed:
            for movie in movies:
                if movie['movieId'] == sf:
                    sorted_movies.append(movie)

        if sorted_movies is None:
            sorted_movies = []
        if len(sorted_movies) == 0:
            sorted_movies = movies

        # Handle pagination
        while 'LastEvaluatedKey' in response:
            response = movie_table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
            movies.extend(response.get('Items', []))

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps(sorted_movies)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps({'error': str(e)})
        }
