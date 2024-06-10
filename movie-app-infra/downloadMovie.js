// lib/lambda/downloadMovie.js
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const movieBucket = process.env.MOVIE_BUCKET_NAME;

exports.handler = async (event) => {
    const { movieId, fileName } = event.queryStringParameters;

    const s3Params = {
        Bucket: movieBucket,
        Key: `${movieId}/${fileName}`,
    };

    try {
        const data = await s3.getObject(s3Params).promise();

        return {
            statusCode: 200,
            headers: {
                'Content-Type': data.ContentType,
                'Content-Disposition': `attachment; filename="${fileName}"`,
            },
            body: data.Body.toString('base64'),
            isBase64Encoded: true,
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message }),
        };
    }
};
