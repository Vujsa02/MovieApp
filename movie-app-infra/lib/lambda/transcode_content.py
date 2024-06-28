import json
import boto3
import subprocess
import base64
import os

s3 = boto3.client('s3')
transcode_bucket = os.environ['TRANSCODE_BUCKET_NAME']


def lambda_handler(event, context):
    # Extract movieId and file content from the event
    body = json.loads(event['body'])

    movie_id = body['movieId']
    file_content_base64 = body['fileContent']
    file_content = base64.b64decode(file_content_base64.split(',')[1])  # Remove data prefix

    # Save file to a temporary location
    input_filename = '/tmp/input.mp4'
    with open(input_filename, 'wb') as f:
        f.write(file_content)

    # Define resolutions
    resolutions = {
        '480p': '640x480',
        '720p': '1280x720',
        '1080p': '1920x1080'
    }

    presigned_urls = {}
    content = {}

    for resolution, size in resolutions.items():
        output_filename = f'/tmp/output_{resolution}.mp4'
        s3_key = f'{movie_id}/{resolution}.mp4'

        # Transcode video using ffmpeg from the current directory
        subprocess.run(['./ffmpeg', '-i', input_filename, '-vf', f'scale={size}', output_filename])

        # Read the transcoded file into a byte array
        with open(output_filename, 'rb') as f:
            byte_array = f.read()

        # Encode to base64 and prepend data prefix
        content_base64 = base64.b64encode(byte_array).decode('utf-8')
        content_with_prefix = f'data:video/mp4;base64,{content_base64}'

        content[resolution] = content_with_prefix

        # Generate presigned URL
        presigned_url = s3.generate_presigned_url(
            ClientMethod='put_object',
            Params={
                'Bucket': transcode_bucket,
                'Key': s3_key,
                'ContentType': 'video/mp4'
            },
            ExpiresIn=3600  # Presigned URL expiration time in seconds
        )

        presigned_urls[resolution] = presigned_url

        # Delete the output file after reading
        os.remove(output_filename)

    # Delete the input file
    os.remove(input_filename)

    return {
        'statusCode': 200,
        'body': json.dumps({
            'presignedUrls': presigned_urls,
            'content': content
        })
    }
