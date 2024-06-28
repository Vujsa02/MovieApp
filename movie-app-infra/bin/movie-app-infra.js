#!/usr/bin/env node
const cdk = require('aws-cdk-lib');
const { MovieAppInfraStack } = require('../lib/movie-app-infra-stack');

const app = new cdk.App();
new MovieAppInfraStack(app, 'MovieAppInfraStack');
