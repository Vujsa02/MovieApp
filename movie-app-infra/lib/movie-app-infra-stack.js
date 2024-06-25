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
const path = require('path');

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
      tableName: "mmm-movie-table"
    });

    // User pool

    const reviewTable = new dynamodb.Table(this, 'ReviewTable', {
      partitionKey: { name: 'reviewId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'movieId', type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      tableName: "mmm-review-table"
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
        }
      }
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

    // SNS Topic for notifications
    const topic = new sns.Topic(this, 'MovieTopic');

    // Upload movie Lambda function
    const uploadMovieLambda = new lambda.Function(this, 'UploadMovieFunction', {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, '/lambda')),
      handler: 'upload_movie.lambda_handler',
      environment: {
        MOVIE_BUCKET_NAME: movieBucket.bucketName,
        MOVIE_TABLE_NAME: movieTable.tableName,
      },
    });

    movieBucket.grantPut(uploadMovieLambda);
    movieTable.grantWriteData(uploadMovieLambda);

    // Download movie Lambda function
    const downloadMovieLambda = new lambda.Function(this, 'DownloadMovieFunction', {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, '/lambda')),
      handler: 'download_movie.lambda_handler',
      environment: {
        MOVIE_BUCKET_NAME: movieBucket.bucketName,
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
      },
    });

    movieTable.grantReadData(getMoviesMetadataLambda);


    const addReviewLambda = new lambda.Function(this, 'AddReviewFunction', {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, '/lambda')),
      handler: 'add_review.lambda_handler',
      environment: {
        REVIEW_TABLE_NAME: reviewTable.tableName,
      },
    });

    reviewTable.grantWriteData(addReviewLambda);


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

    // CloudFront distribution for Angular app
    const distribution = new cloudfront.CloudFrontWebDistribution(this, 'MovieAppDistribution', {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: movieBucket,
          },
          behaviors: [{ isDefaultBehavior: true }],
        },
      ],
    });

    // Deploy Angular app to S3 and invalidate CloudFront cache
    // new s3deploy.BucketDeployment(this, 'DeployWebsite', {
    //   sources: [s3deploy.Source.asset('../MovieApp/dist/booking-app')],
    //   destinationBucket: movieBucket,
    //   distribution,
    //   distributionPaths: ['/*'],
    // });

    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: distribution.distributionDomainName,
    });
  }
}

module.exports = { MovieAppInfraStack };











//
//
//
//
//
// const cdk = require('aws-cdk-lib');
// const s3 = require('aws-cdk-lib/aws-s3');
// const dynamodb = require('aws-cdk-lib/aws-dynamodb');
// const cognito = require('aws-cdk-lib/aws-cognito');
// const apigateway = require('aws-cdk-lib/aws-apigateway');
// const lambda = require('aws-cdk-lib/aws-lambda');
// const sns = require('aws-cdk-lib/aws-sns');
// const subscriptions = require('aws-cdk-lib/aws-sns-subscriptions');
// const cloudfront = require('aws-cdk-lib/aws-cloudfront');
// const s3deploy = require('aws-cdk-lib/aws-s3-deployment');
// const path = require('path');
//
// class MovieAppInfraStack extends cdk.Stack {
//   constructor(scope, id, props) {
//     super(scope, id, props);
//
//     // S3 bucket for storing movies
//     const movieBucket = new s3.Bucket(this, 'MovieBucket', {
//       bucketName: "mmm-movie-bucket",
//       removalPolicy: cdk.RemovalPolicy.DESTROY,
//       versioned: true,
//       cors: [
//         {
//           allowedHeaders: ["*"],
//           allowedMethods: [
//             s3.HttpMethods.GET,
//             s3.HttpMethods.PUT,
//             s3.HttpMethods.POST,
//             s3.HttpMethods.DELETE,
//           ],
//           allowedOrigins: ["http://localhost:4200"],
//           exposedHeaders: ["ETag"],
//           maxAge: 3000,
//         },
//       ],
//     });
//
//     // DynamoDB table for metadata
//     const movieTable = new dynamodb.Table(this, 'MovieTable', {
//       partitionKey: { name: 'movieId', type: dynamodb.AttributeType.STRING },
//       sortKey: { name: 'createdAt', type: dynamodb.AttributeType.STRING },
//       removalPolicy: cdk.RemovalPolicy.DESTROY,
//       tableName: "mmm-movie-table"
//     });
//
//     // DynamoDB table for reviews
//     const reviewTable = new dynamodb.Table(this, 'ReviewTable', {
//       partitionKey: { name: 'reviewId', type: dynamodb.AttributeType.STRING },
//       sortKey: { name: 'movieId', type: dynamodb.AttributeType.STRING },
//       removalPolicy: cdk.RemovalPolicy.DESTROY,
//       tableName: "mmm-review-table"
//     });
//
//     // Cognito User Pool
//     const userPool = new cognito.UserPool(this, 'UserPool', {
//       selfSignUpEnabled: true,
//       signInAliases: { email: true, username: true },
//       passwordPolicy: {
//         minLength: 8,
//         requireLowercase: true,
//         requireUppercase: true,
//         requireDigits: true,
//       },
//       autoVerify: { email: true },
//       userVerification: {
//         emailSubject: "Verify your email address",
//         emailBody: "Hello, Thanks for signing up to our app! Click here to verify your email address {##Verify Email##}",
//         emailStyle: cognito.VerificationEmailStyle.LINK,
//       },
//       standardAttributes: {
//         email: { mutable: true, required: true },
//         familyName: { mutable: true, required: true },
//         givenName: { mutable: true, required: true },
//         birthdate: { mutable: true, required: true }
//       }
//     });
//
//     // App Client
//     const userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
//       userPool,
//       generateSecret: false,
//     });
//
//     // User Pool Domain
//     const userPoolDomain = new cognito.UserPoolDomain(this, 'UserPoolDomain', {
//       userPool,
//       cognitoDomain: {
//         domainPrefix: 'cine-cloud-auth', // replace with a unique domain prefix
//       },
//     });
//
//     // Define User Groups
//     const adminGroup = new cognito.CfnUserPoolGroup(this, 'AdminsGroup', {
//       groupName: 'Admins',
//       userPoolId: userPool.userPoolId,
//     });
//
//     const userGroup = new cognito.CfnUserPoolGroup(this, 'UsersGroup', {
//       groupName: 'Users',
//       userPoolId: userPool.userPoolId,
//     });
//
//     // Output values for reference
//     new cdk.CfnOutput(this, 'UserPoolId', {
//       value: userPool.userPoolId,
//     });
//     new cdk.CfnOutput(this, 'UserPoolClientId', {
//       value: userPoolClient.userPoolClientId,
//     });
//     new cdk.CfnOutput(this, 'UserPoolDomainOutput', {
//       value: userPoolDomain.domainName,
//     });
//
//     // Upload movie Lambda function
//     const uploadMovieLambda = new lambda.Function(this, 'UploadMovieFunction', {
//       runtime: lambda.Runtime.PYTHON_3_9,
//       code: lambda.Code.fromAsset(path.join(__dirname, '/lambda')),
//       handler: 'upload_movie.lambda_handler',
//       environment: {
//         MOVIE_BUCKET_NAME: movieBucket.bucketName,
//         MOVIE_TABLE_NAME: movieTable.tableName,
//       },
//     });
//
//     movieBucket.grantPut(uploadMovieLambda);
//     movieTable.grantWriteData(uploadMovieLambda);
//
//     // Download movie Lambda function
//     const downloadMovieLambda = new lambda.Function(this, 'DownloadMovieFunction', {
//       runtime: lambda.Runtime.PYTHON_3_9,
//       code: lambda.Code.fromAsset(path.join(__dirname, '/lambda')),
//       handler: 'download_movie.lambda_handler',
//       environment: {
//         MOVIE_BUCKET_NAME: movieBucket.bucketName,
//       },
//     });
//
//     movieBucket.grantRead(downloadMovieLambda);
//
//     // Get movies metadata Lambda function
//     const getMoviesMetadataLambda = new lambda.Function(this, 'GetMoviesMetadataFunction', {
//       runtime: lambda.Runtime.PYTHON_3_9,
//       code: lambda.Code.fromAsset(path.join(__dirname, '/lambda')),
//       handler: 'get_movies_metadata.lambda_handler',
//       environment: {
//         MOVIE_TABLE_NAME: movieTable.tableName,
//       },
//     });
//
//     movieTable.grantReadData(getMoviesMetadataLambda);
//
//     // Add review Lambda function
//     const addReviewLambda = new lambda.Function(this, 'AddReviewFunction', {
//       runtime: lambda.Runtime.PYTHON_3_9,
//       code: lambda.Code.fromAsset(path.join(__dirname, '/lambda')),
//       handler: 'add_review.lambda_handler',
//       environment: {
//         REVIEW_TABLE_NAME: reviewTable.tableName,
//       },
//     });
//
//     reviewTable.grantWriteData(addReviewLambda);
//
//     // API Gateway
//     const api = new apigateway.RestApi(this, 'MovieApi', {
//       restApiName: 'Movie Service',
//       description: 'This service serves movies and reviews.',
//     });
//
//     // Movies endpoints
//     const moviesResource = api.root.addResource('movies');
//     moviesResource.addMethod('POST', new apigateway.LambdaIntegration(uploadMovieLambda));
//
//     const movieResource = moviesResource.addResource('download').addResource('{movieId}');
//     movieResource.addMethod('GET', new apigateway.LambdaIntegration(downloadMovieLambda));
//
//     moviesResource.addMethod('GET', new apigateway.LambdaIntegration(getMoviesMetadataLambda));
//
//     // Reviews endpoints
//     const reviewsResource = api.root.addResource('reviews');
//     reviewsResource.addMethod('POST', new apigateway.LambdaIntegration(addReviewLambda));
//
//     // Authorization setup
//     const auth = new apigateway.CognitoUserPoolsAuthorizer(this, 'MovieAppAuthorizer', {
//       cognitoUserPools: [userPool],
//     });
//
//     // Assigning permissions based on user groups
//     const movies = api.root.addResource('movies');
//     const reviews = api.root.addResource('reviews');
//
//     // Movies endpoints permissions
//     const movieResource = movies.addResource('{movieId}');
//     movieResource.addMethod('GET', new apigateway.LambdaIntegration(downloadMovieLambda), {
//       authorizationType: apigateway.AuthorizationType.COGNITO,
//       authorizer: { authorizerId: auth.ref },
//     });
//
//     // Admin-only endpoint for uploading movies
//     const adminMoviesResource = movies.addResource('admin');
//     adminMoviesResource.addMethod('POST', new apigateway.LambdaIntegration(uploadMovieLambda), {
//       authorizationType: apigateway.AuthorizationType.COGNITO,
//       authorizer: { authorizerId: auth.ref },
//       methodResponses: [{ statusCode: '201' }, { statusCode: '400' }],
//     });
//
//     // Reviews endpoints permissions
//     reviews.addMethod('POST', new apigateway.LambdaIntegration(addReviewLambda), {
//       authorizationType: apigateway.AuthorizationType.COGNITO,
//       authorizer: { authorizerId: auth.ref },
//       methodResponses: [{ statusCode: '201' }, { statusCode: '400' }],
//     });
//
//     // Assign user groups to endpoints
//     adminMoviesResource.addMethod('OPTIONS');
//     adminMoviesResource.addMethod('GET');
//     adminMoviesResource.addMethod('DELETE');
//     adminMoviesResource.addMethod('PUT');
//     adminMoviesResource.addMethod('PATCH');
//   }
// }
//
// module.exports = { MovieAppInfraStack };
//
