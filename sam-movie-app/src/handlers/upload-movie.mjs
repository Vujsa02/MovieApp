const AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-central-1' });
const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();
const uuid = require('uuid');

exports.handler = async (event) => {
    const { file, fileName, metadata } = JSON.parse(event.body);

    // Generate unique ID for the file
    const fileId = uuid.v4();

    // Upload the file to S3
    const s3Params = {
        Bucket: 'movie-bucket-baki123',
        Key: fileId,
        Body: Buffer.from(file, 'base64'), // Assuming the file is sent as a base64 string
    };

    try {
        await s3.upload(s3Params).promise();

        // Store metadata in DynamoDB
        const dbParams = {
            TableName: 'MovieMetadata',
            Item: {
                FileID: fileId,
                FileName: fileName,
                Metadata: metadata,
            },
        };
        await dynamodb.put(dbParams).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'File uploaded successfully', fileId }),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'File upload failed', error: error.message }),
        };
    }
};