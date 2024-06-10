// lib/lambda/uploadMovie.js
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();
const { v4: uuidv4 } = require('uuid');
const movieBucket = process.env.MOVIE_BUCKET_NAME;
const movieTable = process.env.MOVIE_TABLE_NAME;

exports.handler = async (event) => {
    const { title, description, fileName, fileContent } = JSON.parse(event.body);

    const movieId = uuidv4();
    const createdAt = new Date().toISOString();

    const s3Params = {
        Bucket: movieBucket,
        Key: `${movieId}/${fileName}`,
        Body: Buffer.from(fileContent, 'base64'),
    };

    const dbParams = {
        TableName: movieTable,
        Item: {
            movieId,
            title,
            description,
            fileName,
            createdAt,
        },
    };

    try {
        console.log('Uploading file to S3:', s3Params);
        await s3.upload(s3Params).promise();
        console.log('File uploaded successfully to S3');

        console.log('Saving movie metadata to DynamoDB:', dbParams);
        await dynamodb.put(dbParams).promise();
        console.log('Movie metadata saved to DynamoDB');

        return {
            statusCode: 201,
            body: JSON.stringify({ message: 'Movie uploaded successfully' }),
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message }),
        };
    }
};
