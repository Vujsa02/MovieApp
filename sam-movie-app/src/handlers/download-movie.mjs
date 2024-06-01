const AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-central-1' });
const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const fileId = event.pathParameters.fileId;

    try {
        // Retrieve metadata from DynamoDB
        const dbParams = {
            TableName: 'MovieMetadata',
            Key: { FileID: fileId },
        };
        const dbResponse = await dynamodb.get(dbParams).promise();
        const item = dbResponse.Item;

        if (!item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'File not found' }),
            };
        }

        // Retrieve file from S3
        const s3Params = {
            Bucket: 'movie-bucket-baki123',
            Key: fileId,
        };
        const s3Response = await s3.getObject(s3Params).promise();

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/octet-stream',
                'Content-Disposition': `attachment; filename=${item.FileName}`,
            },
            body: s3Response.Body.toString('base64'),
            isBase64Encoded: true,
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'File download failed', error: error.message }),
        };
    }
};