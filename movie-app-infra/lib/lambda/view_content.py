import boto3
import json
import os

s3 = boto3.client('s3')
movie_bucket = os.environ['MOVIE_BUCKET_NAME']

def lambda_handler(event, context):
    movie_id = event['pathParameters']['movieId']  # Assuming the movie ID is passed in the path

    # Retrieve the S3 key (filename) for the movie from DynamoDB or another source
    # Assuming the S3 key is stored in DynamoDB in 's3Key' attribute
    s3_key = f"{movie_id}"
    try:
        # Generate presigned URL for accessing the movie file from S3
        presigned_url = s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': movie_bucket, 'Key': s3_key},
            ExpiresIn=3600  # URL expiry time in seconds, adjust as needed
        )

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
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
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Could not generate presigned URL'})
        }
