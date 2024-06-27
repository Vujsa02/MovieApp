const cdk = require('aws-cdk-lib');
const s3 = require('aws-cdk-lib/aws-s3');
const dynamodb = require('aws-cdk-lib/aws-dynamodb');
const cognito = require('aws-cdk-lib/aws-cognito');
const apigateway = require('aws-cdk-lib/aws-apigateway');
const lambda = require('aws-cdk-lib/aws-lambda');
const sns = require('aws-cdk-lib/aws-sns');
const subscriptions = require('aws-cdk-lib/aws-sns-subscriptions');
const cloudfront = require('aws-cdk-lib/aws-cloudfront');
const s3deploy = require('aws-cdk-lib/aws-s3-deployment');
const iam = require('aws-cdk-lib/aws-iam');
const path = require('path');
const sqs = require('aws-cdk-lib/aws-sqs');
const {PolicyStatement} = require("aws-cdk-lib/aws-iam");
const eventSources = require('aws-cdk-lib/aws-lambda-event-sources');
const sources = require('aws-cdk-lib/aws-lambda-event-sources');
const destinations = require('aws-cdk-lib/aws-lambda-destinations');
const { Stack } = cdk;
const { WebSocketApi, WebSocketStage, WebSocketIntegration} = require('aws-cdk-lib/aws-apigatewayv2');
const { WebSocketLambdaIntegration } = require('@aws-cdk/aws-apigatewayv2-integrations-alpha');
const {IntegrationType} = require("aws-cdk-lib/aws-apigateway");

class MovieAppInfraStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // S3 bucket for storing movies
    const movieBucket = new s3.Bucket(this, 'MovieBucket', {
      bucketName: "mmm-movie-bucket",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      versioned: true,
      cors: [
        {
          allowedHeaders: ["*"],
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.PUT,
            s3.HttpMethods.POST,
            s3.HttpMethods.DELETE,
          ],
          allowedOrigins: ["http://localhost:4200"],
          exposedHeaders: ["ETag"],
          maxAge: 3000,
        },
      ],
    });

    // DynamoDB table for metadata
    const movieTable = new dynamodb.Table(this, 'MovieTable', {
      partitionKey: { name: 'movieId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'createdAt', type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      tableName: "mmm-movie-table",
    });

    movieTable.addGlobalSecondaryIndex({
      indexName: 'TitleIndex',
      partitionKey: { name: 'title', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    movieTable.addGlobalSecondaryIndex({
          indexName: 'DirectorIndex',
          partitionKey: { name: 'director', type: dynamodb.AttributeType.STRING },
          projectionType: dynamodb.ProjectionType.ALL,
        });

    movieTable.addGlobalSecondaryIndex({
      indexName: 'DescriptionIndex',
      partitionKey: { name: 'description', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // DynamoDB table for reviews
    const reviewTable = new dynamodb.Table(this, 'ReviewTable', {
      partitionKey: { name: 'reviewId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'movieId', type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      tableName: "mmm-review-table",
    });

    // DynamoDB table for subscriptions
    const subscriptionTable = new dynamodb.Table(this, 'SubscriptionTable', {
      partitionKey: { name: 'email', type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      tableName: "mmm-subscription-table",
    });

    // DynamoDB table for userFeed
    const userFeedTable = new dynamodb.Table(this, 'UserFeedTable', {
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      tableName: "mmm-user-feed-table",
    });

    // DynamoDB table for userInteractions
    const userInteractionsTable = new dynamodb.Table(this, 'UserInteractionsTable', {
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      tableName: "mmm-user-interactions-table",
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
    });


    // SQS Queue for Email Notifications
    const emailQueue = new sqs.Queue(this, 'EmailQueue', {
      queueName: 'mmm-email-queue',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Output SQS Queue URL
    new cdk.CfnOutput(this, 'EmailQueueUrl', {
      value: emailQueue.queueUrl,
    });

    // Cognito User Pool
    const userPool = new cognito.UserPool(this, 'UserPool', {
      selfSignUpEnabled: true,
      signInAliases: { email: true, username: true},
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
      },
      autoVerify: { email: true },
      userVerification:{
        emailSubject: "Verify your email address",
        emailBody: "Hello, Thanks for signing up to our app! Click here to verify your email address {##Verify Email##}",
        emailStyle: cognito.VerificationEmailStyle.LINK,
      },

      standardAttributes: {
        email: {
          mutable: true,
          required: true,
        },
        familyName: {
          mutable: true,
          required: true,
        },
        givenName: {
          mutable: true,
          required: true,
        },
        birthdate: {
          mutable: true,
          required: true,
        },
      },
    });

    // App Client
    const userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
      userPool,
      generateSecret: false,
    });

    // User Pool Domain
    const userPoolDomain = new cognito.UserPoolDomain(this, 'UserPoolDomain', {
      userPool,
      cognitoDomain: {
        domainPrefix: 'cine-cloud-auth', // replace with a unique domain prefix
      },
    });

    // Output values for reference
    new cdk.CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
    });
    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
    });
    new cdk.CfnOutput(this, 'UserPoolDomainOutput', {
      value: userPoolDomain.domainName,
    });

    // SNS Topic for notifications on Angular app
    const topic = new sns.Topic(this, 'MovieTopic');

    // Upload movie Lambda function
    const uploadMovieLambda = new lambda.Function(this, 'UploadMovieFunction', {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, '/lambda')),
      handler: 'upload_movie.lambda_handler',
      environment: {
        MOVIE_BUCKET_NAME: movieBucket.bucketName,
        MOVIE_TABLE_NAME: movieTable.tableName,
        SUBSCRIPTION_TABLE_NAME: subscriptionTable.tableName,
        EMAIL_QUEUE_URL: emailQueue.queueUrl,
      },
    });

    movieBucket.grantPut(uploadMovieLambda);
    movieTable.grantWriteData(uploadMovieLambda);

    const updateMovieLambda = new lambda.Function(this, 'UpdateMovieFunction', {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, '/lambda')),
      handler: 'update_movie.lambda_handler',
      environment: {
        MOVIE_BUCKET_NAME: movieBucket.bucketName,
        MOVIE_TABLE_NAME: movieTable.tableName,
        SUBSCRIPTION_TABLE_NAME: subscriptionTable.tableName,
        EMAIL_QUEUE_URL: emailQueue.queueUrl,
      },
    });

    movieBucket.grantPut(updateMovieLambda);
    movieTable.grantWriteData(updateMovieLambda);

    // Download movie Lambda function
    const downloadMovieLambda = new lambda.Function(this, 'DownloadMovieFunction', {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, '/lambda')),
      handler: 'download_movie.lambda_handler',
      environment: {
        MOVIE_BUCKET_NAME: movieBucket.bucketName,
        INTERACTIONS_TABLE_NAME: userInteractionsTable.tableName,
      },
    });

    movieBucket.grantRead(downloadMovieLambda);

    // Get movies metadata Lambda function
    const getMoviesMetadataLambda = new lambda.Function(this, 'GetMoviesMetadataFunction', {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, '/lambda')),
      handler: 'get_movies_metadata.lambda_handler',
      environment: {
        MOVIE_TABLE_NAME: movieTable.tableName,
        FEED_TABLE_NAME: userFeedTable.tableName,
      },
    });

    movieTable.grantReadData(getMoviesMetadataLambda);

    const getMovieMetadataByIdLambda = new lambda.Function(this, 'GetMovieMetadataByIdFunction', {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, '/lambda')),
      handler: 'get_movie_metadata_by_id.lambda_handler',
      environment: {
        MOVIE_TABLE_NAME: movieTable.tableName,
      },
    });

    movieTable.grantReadData(getMovieMetadataByIdLambda);

    const viewContentLambda = new lambda.Function(this, 'ViewContentFunction', {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, '/lambda')),
      handler: 'view_content.lambda_handler', // Adjust based on your lambda handler file
      environment: {
        MOVIE_BUCKET_NAME: movieBucket.bucketName,
      },
    });

    // Grant permissions to access S3 bucket
    movieBucket.grantRead(viewContentLambda);


    const addReviewLambda = new lambda.Function(this, 'AddReviewFunction', {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, '/lambda')),
      handler: 'add_review.lambda_handler',
      environment: {
        REVIEW_TABLE_NAME: reviewTable.tableName,
        INTERACTIONS_TABLE_NAME: userInteractionsTable.tableName,
      },
    });

    reviewTable.grantWriteData(addReviewLambda);

    const queryMoviesLambda = new lambda.Function(this, 'QueryMoviesFunction', {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, '/lambda')),
      handler: 'search_movies.lambda_handler',
      environment: {
        MOVIE_TABLE_NAME: movieTable.tableName,
      },
    });

    movieTable.grantReadData(queryMoviesLambda);

    const queryMoviesPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['dynamodb:Query'],
      resources: [
        movieTable.tableArn,
        `${movieTable.tableArn}/index/TitleIndex`,
        `${movieTable.tableArn}/index/DirectorIndex`,
        `${movieTable.tableArn}/index/GenreIndex`,
        `${movieTable.tableArn}/index/ActorsIndex`,
        `${movieTable.tableArn}/index/DescriptionIndex`,
      ],
    });

    queryMoviesLambda.addToRolePolicy(queryMoviesPolicy);

    const subscribeLambda = new lambda.Function(this, 'SubscribeFunction', {
        runtime: lambda.Runtime.PYTHON_3_9,
        code: lambda.Code.fromAsset(path.join(__dirname, '/lambda')),
        handler: 'subscribe.lambda_handler',
        environment: {
          SUBSCRIPTION_TABLE_NAME: subscriptionTable.tableName,
          INTERACTIONS_TABLE_NAME: userInteractionsTable.tableName,
        },
    });
    subscribeLambda.addToRolePolicy(new PolicyStatement({
      actions:['ses:VerifyEmailIdentity'],
      resources: ['*'],
    }));

    subscriptionTable.grantWriteData(subscribeLambda);
    subscriptionTable.grantReadData(uploadMovieLambda);
    emailQueue.grantSendMessages(uploadMovieLambda);
    userInteractionsTable.grantReadWriteData(subscribeLambda);
    userInteractionsTable.grantReadWriteData(addReviewLambda);
    userInteractionsTable.grantReadWriteData(downloadMovieLambda);

    // Lambda Function for Sending Emails
    const sendEmailLambda = new lambda.Function(this, 'SendEmailFunction', {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'send_message.lambda_handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '/lambda')),
      environment: {
        EMAIL_QUEUE_URL: emailQueue.queueUrl,
        SENDER_EMAIL: 'bakibookingteam17@gmail.com',
      },
    });

    sendEmailLambda.addToRolePolicy(new PolicyStatement({
      actions: ['ses:SendEmail', 'ses:SendRawEmail'],
      resources: ['*'],
    }));

    // Event Source Mapping for SQS
    const eventSource = new eventSources.SqsEventSource(emailQueue, {
      batchSize: 10,
    });
    sendEmailLambda.addEventSource(eventSource);

    // Delete movie Lambda function
    const deleteMovieLambda = new lambda.Function(this, 'DeleteMovieFunction', {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, '/lambda')),
      handler: 'delete_movie.lambda_handler',
      environment: {
        MOVIE_BUCKET_NAME: movieBucket.bucketName,
        MOVIE_TABLE_NAME: movieTable.tableName,
      },
    });

    movieBucket.grantDelete(deleteMovieLambda);
    movieTable.grantReadWriteData(deleteMovieLambda);

    const updateFeedLambda = new lambda.Function(this, 'UpdateFeedLambda', {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'feed_update.lambda_handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '/lambda')),
      environment: {
        USER_FEED_TABLE_NAME: userFeedTable.tableName,
        USER_INTERACTIONS_TABLE_NAME: userInteractionsTable.tableName,
        MOVIE_TABLE_NAME: movieTable.tableName,
        SNS_TOPIC_ARN: topic.topicArn,
      }
    });

    // Grant necessary permissions to the Lambda function
    userFeedTable.grantReadWriteData(updateFeedLambda);
    userInteractionsTable.grantStreamRead(updateFeedLambda);
    userInteractionsTable.grantReadWriteData(updateFeedLambda);
    movieTable.grantReadData(updateFeedLambda);

    updateFeedLambda.addToRolePolicy(new PolicyStatement({
      actions: ['dynamodb:GetItem'],
      resources: [userInteractionsTable.tableArn],
    }));
    updateFeedLambda.addToRolePolicy(new PolicyStatement({
        actions: ['sns:Publish'],
        resources: [topic.topicArn],
    }));

    const deadLetterQueue = new sqs.Queue(this, 'DeadLetterQueue');

    // Create event source mapping to trigger the Lambda function on DynamoDB stream events
    updateFeedLambda.addEventSource(new sources.DynamoEventSource(userInteractionsTable, {
      startingPosition: lambda.StartingPosition.TRIM_HORIZON,
      batchSize: 5,
      bisectBatchOnFunctionError: true,
      onFailure: new destinations.SqsDestination(deadLetterQueue),
      retryAttempts: 10,
    }));


    // Create WebSocket API
    const webSocketApi = new WebSocketApi(this, 'MovieWebSocketApi', {
      apiName: 'MovieWebSocketApi',
    });

    // Create WebSocket Stage
    new WebSocketStage(this, 'MovieWebSocketStage', {
      webSocketApi,
      stageName: 'dev',
      autoDeploy: true,
    });

    // Create WebSocket Lambda function
    const webSocketHandler = new lambda.Function(this, 'WebSocketHandler', {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'websocket.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'lambda')),
      environment: {
        USER_FEED_TABLE_NAME: userFeedTable.tableName,
      },
    });

    // Allow Lambda to publish to SNS
    webSocketHandler.addToRolePolicy(new PolicyStatement({
      actions: ['sns:Publish'],
      resources: [topic.topicArn],
    }));

    // Subscribe Lambda function to SNS topic
    topic.addSubscription(new subscriptions.LambdaSubscription(webSocketHandler));

    // Define WebSocket integration for Lambda
    const integration = new WebSocketLambdaIntegration('WebSocketIntegration', webSocketHandler);

    // Add WebSocket route
    webSocketApi.addRoute('sendmessage', {
      integration,
    });

    // Output WebSocket API endpoint URL
    new cdk.CfnOutput(this, 'WebSocketApiUrl', {
      value: webSocketApi.apiEndpoint,
    });


    // API Gateway
    const api = new apigateway.RestApi(this, 'MovieApi', {
      restApiName: 'Movie Service',
      description: 'This service serves movies.',
    });

    const moviesResource = api.root.addResource('movies');
    moviesResource.addMethod('POST', new apigateway.LambdaIntegration(uploadMovieLambda));

    const movieResource = moviesResource.addResource('download').addResource('{movieId}');
    movieResource.addMethod('GET', new apigateway.LambdaIntegration(downloadMovieLambda));
    moviesResource.addMethod('GET', new apigateway.LambdaIntegration(getMoviesMetadataLambda));

    const reviewsResource = api.root.addResource('reviews');
    reviewsResource.addMethod('POST', new apigateway.LambdaIntegration(addReviewLambda));

    const movieByIdResource = moviesResource.addResource('{movieId}');
    movieByIdResource.addMethod('GET', new apigateway.LambdaIntegration(getMovieMetadataByIdLambda));
    movieByIdResource.addMethod('DELETE', new apigateway.LambdaIntegration(deleteMovieLambda));
    movieByIdResource.addMethod('PUT', new apigateway.LambdaIntegration(updateMovieLambda));

    const streamMovieResource = moviesResource.addResource('stream').addResource('{movieId}');
    streamMovieResource.addMethod('GET', new apigateway.LambdaIntegration(viewContentLambda));

    const searchMoviesResource = api.root.addResource('search');
    searchMoviesResource.addMethod('POST', new apigateway.LambdaIntegration(queryMoviesLambda));

    const subscribeResource = api.root.addResource('subscribe');
    subscribeResource.addMethod('PUT', new apigateway.LambdaIntegration(subscribeLambda));



  //   // CloudFront distribution for Angular app
  //   const distribution = new cloudfront.CloudFrontWebDistribution(this, 'MovieAppDistribution', {
  //     originConfigs: [
  //       {
  //         s3OriginSource: {
  //           s3BucketSource: movieBucket,
  //         },
  //         behaviors: [{ isDefaultBehavior: true }],
  //       },
  //     ],
  //   });
  //
  //   // Deploy Angular app to S3 and invalidate CloudFront cache
  //   new s3deploy.BucketDeployment(this, 'DeployWebsite', {
  //     sources: [s3deploy.Source.asset('../MovieApp/dist/booking-app')],
  //     destinationBucket: movieBucket,
  //     distribution,
  //     distributionPaths: ['/*'],
  //   });
  //
  //   new cdk.CfnOutput(this, 'DistributionDomainName', {
  //     value: distribution.distributionDomainName,
  //   });
  }
}

module.exports = { MovieAppInfraStack };
