import * as cdk from 'aws-cdk-lib';
import {Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as path from "path";

export class StoresLambdaStack extends Stack {

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        // DybanmoDB table stores
        const tableStore = new dynamodb.Table(this, 'StoreTable', {
            partitionKey: {name: 'id', type: dynamodb.AttributeType.STRING},
            tableName: 'InfrastructureTable',
            removalPolicy: cdk.RemovalPolicy.DESTROY
        });

        // Lambda function GET
        const getLambdaStores = new lambda.Function(this, 'ListLambdaStore', {
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'handlers.list',
            code: lambda.Code.fromAsset(path.resolve(__dirname, 'stores')),
            environment: {
                TABLE_NAME: tableStore.tableName
            }
        });

        // Lambda function POST
        const postLambdaStore = new lambda.Function(this, 'SaveLambdaStore', {
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'handlers.save',
            code: lambda.Code.fromAsset(path.resolve(__dirname, 'stores')),
            environment: {
                TABLE_NAME: tableStore.tableName
            }
        });


        // Lambda function GET
        const findLambdaStore = new lambda.Function(this, 'FindLambdaStore', {
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'handlers.find',
            code: lambda.Code.fromAsset(path.resolve(__dirname, 'stores')),
            environment: {
                TABLE_NAME: tableStore.tableName
            }
        });

        // Lambda function DELETE
        const deleteLambdaStore = new lambda.Function(this, 'DeleteLambdaStore', {
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'handlers.delete',
            code: lambda.Code.fromAsset(path.resolve(__dirname, 'stores')),
            environment: {
                TABLE_NAME: tableStore.tableName
            }
        });

        // permission to lambda to access dynamodb table
        tableStore.grantReadWriteData(postLambdaStore);
        tableStore.grantReadWriteData(deleteLambdaStore);
        tableStore.grantReadData(getLambdaStores);
        tableStore.grantReadData(findLambdaStore);

        // create api gateway and connect to lambda
        const apigate = new apigw.RestApi(this, 'ApiGatewayStore');
        apigate.root
            .resourceForPath('stores')
            .addMethod('GET', new apigw.LambdaIntegration(getLambdaStores));

        apigate.root
            .resourceForPath('stores')
            .addMethod('POST', new apigw.LambdaIntegration(postLambdaStore));

        apigate.root
            .resourceForPath('store')
            .addMethod('GET', new apigw.LambdaIntegration(findLambdaStore));

        apigate.root
            .resourceForPath('store')
            .addMethod('DELETE', new apigw.LambdaIntegration(deleteLambdaStore));

    }
}
