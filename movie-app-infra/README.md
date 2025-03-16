# Movie App Infrastructure (AWS CDK)
This folder contains the infrastructure code for the Movie/Series platform built using AWS CDK. The infrastructure is defined using AWS CDK (Cloud Development Kit) and is responsible for setting up the necessary AWS resources such as S3 buckets, DynamoDB tables, Lambda functions, API Gateway, Cognito, and more.

## Overview
The infrastructure is designed to support a movie/series platform where users can upload, stream, and manage movies and series. The platform also includes features like user authentication, movie metadata storage, reviews, subscriptions, and more.

## Prerequisites
Before deploying the infrastructure, ensure you have the following:

**AWS CLI**: Install and configure the AWS CLI with your credentials. 

[Install AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)  
[Configure AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html)

**AWS CDK**: Install the AWS CDK globally.  
`npm install -g aws-cdk`

**Python**: Ensure Python is installed as the Lambda functions are written in Python.  
[Download Python](https://www.python.org/downloads/)

**Node.js**: Required for running the CDK scripts.  
[Download Node.js](https://nodejs.org/en)

**AWS Account**: You need an AWS account with sufficient permissions to create the resources.

The `cdk.json` file tells the CDK Toolkit how to execute your app. The build step is not required when using JavaScript.

## Setup and Deployment
Clone the Repository:  
`git clone <repository-url>
cd movie-app-infra`

Install Dependencies:  
`npm install`

Bootstrap the CDK (if not already done):  
`cdk bootstrap`

Deploy the Stack:  
`cdk deploy`

## Useful commands

* `npm run test`         perform the jest unit tests
* `npx cdk deploy`       deploy this stack to your default AWS account/region
* `npx cdk diff`         compare deployed stack with current state
* `npx cdk synth`        emits the synthesized CloudFormation template
