#!/opt/homebrew/opt/node/bin/node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { StoresLambdaStack } from '../lib/stores-lambda-stack';

const app = new cdk.App();
new StoresLambdaStack(app, 'StoresLambdaStack', {});