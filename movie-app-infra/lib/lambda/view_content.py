import boto3
import json
import os

s3 = boto3.client('s3')
movie_bucket = os.environ['MOVIE_BUCKET_NAME']
transcode_bucket = os.environ['TRANSCODE_BUCKET_NAME']


def lambda_handler(event, context):
    movie_id = event['pathParameters']['movieId']  # Assuming the movie ID is passed in the path
    resolution = event['pathParameters'].get('resolution',
                                             'original')  # Default to 'original' if resolution not specified

    # Construct the S3 key based on resolution
    if resolution == 'original':
        s3_bucket = movie_bucket
        s3_key = movie_id
    else:
        s3_bucket = transcode_bucket
        s3_key = f"{movie_id}/{resolution}.mp4"

    try:
        # Generate presigned URL for accessing the movie file from the selected bucket
        presigned_url = s3.generate_presigned_url(
            'put_object' if resolution == 'original' else 'get_object',
            Params={'Bucket': s3_bucket, 'Key': s3_key},
            ExpiresIn=3600  # URL expiry time in seconds, adjust as needed
        )

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps({
                'presignedUrl': presigned_url
            })
        }
    except Exception as e:
        print(f"Error generating presigned URL: {e}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps({'error': 'Could not generate presigned URL'})
        }
