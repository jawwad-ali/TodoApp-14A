import * as cdk from '@aws-cdk/core';
import * as lambda from "@aws-cdk/aws-lambda";
import * as events from "@aws-cdk/aws-events";
import * as appsync from "@aws-cdk/aws-appsync";
import * as targets from "@aws-cdk/aws-events-targets";
import { Rule } from "@aws-cdk/aws-events";
import * as ddb from "@aws-cdk/aws-dynamodb";
import * as s3 from "@aws-cdk/aws-s3"
import * as s3deploy from "@aws-cdk/aws-s3-deployment"
import * as cloudfront from "@aws-cdk/aws-cloudfront"
import * as origins from '@aws-cdk/aws-cloudfront-origins';
import { CfnOutput } from '@aws-cdk/core';
import { requestTemplate, responseTemplate, EVENT_SOURCE } from "../utils/appsync-request-response"; 

export class TodoBackendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    // create a bucket to upload your app files
    const websiteBucket = new s3.Bucket(this, "WebsiteBucket", {
      versioned: true,
    });

    const distribution = new cloudfront.Distribution(this, "Distribution", {
      defaultBehavior: { 
        origin: new origins.S3Origin(websiteBucket),
      },
      defaultRootObject: "index.html",
    });

    new cdk.CfnOutput(this, "DomainName", {
      value: distribution.domainName,
    });

    new s3deploy.BucketDeployment(this, "DeployWebsite", {
      sources: [s3deploy.Source.asset("../my-hello-world-starter/public")],
      destinationBucket: websiteBucket,
      distribution,
      distributionPaths: ["/*"],
    });

    // API
    const api = new appsync.GraphqlApi(this, "theApi", {
      name: "project14-TodoApp",
      schema: appsync.Schema.fromAsset("schema/schema.gql"),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
        },
      },
      logConfig: { fieldLogLevel: appsync.FieldLogLevel.ALL },
      xrayEnabled: true,
    });

    // Create new DynamoDB Table for Todos
    const todoTable = new ddb.Table(this, "TodoApplication", {
      tableName: "todoApp",
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: "id",
        type: ddb.AttributeType.STRING,
      },
    });

    // DYNAMO  DATASOURCE
    const ddbAsDS = api.addDynamoDbDataSource("theTable", todoTable);

    // HTTP DATASOURCE
    const httpDs = api.addHttpDataSource(
      "ds",
      "https://events." + this.region + ".amazonaws.com",
      {
        name: "httpsWithEventBridge",
        description: "From appsync to EventBridge",
        authorizationConfig: {
          signingRegion: this.region,
          signingServiceName: "events",
        },
      });

    events.EventBus.grantPutEvents(httpDs);

    // RESOLVERS ///////////////////////////
    const mutations = ["addTodo", "deleteTodo"];

    mutations.forEach((mut) => {
      let details = `\\\"id\\\": \\\"$ctx.args.id\\\"`;

      if (mut === "addTodo") {
        details = `\\\"title\\\":\\\"$ctx.args.todo.title\\\", \\\"desc\\\":\\\"$ctx.args.todo.desc\\\"`;
      }
      else if (mut === "deleteTodo") {
        details = `\\\"id\\\":\\\"$ctx.args.id\\\"`;
      }

      httpDs.createResolver({
        typeName: "Mutation",
        fieldName: mut,
        requestMappingTemplate: appsync.MappingTemplate.fromString(requestTemplate(details, mut)),
        responseMappingTemplate: appsync.MappingTemplate.fromString(responseTemplate()),
      });
    });

    // Query Resolver
    ddbAsDS.createResolver({
      typeName: "Query",
      fieldName: "getTodo",
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbScanTable(),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList(),
    })

    // Lambda
    const todoLambda = new lambda.Function(this, "echoFunction", {
      functionName: "todoApp-14A",
      code: lambda.Code.fromAsset("lambda"),
      handler: "index.handler",
      runtime: lambda.Runtime.NODEJS_12_X,
      environment: {
        DYNAMO_TABLE_NAME: todoTable.tableName,
      },
    });
    todoTable.grantReadWriteData(todoLambda)
    todoTable.grantFullAccess(todoLambda)

    // RULE
    const rule = new Rule(this, "theRule", {
      ruleName: "ruleForAppsync",
      eventPattern: {
        source: ["todoAppEvents"],
      },
    });
    rule.addTarget(new targets.LambdaFunction(todoLambda));
  }
}