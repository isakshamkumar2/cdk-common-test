'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.createSnapshotPopulatorLambda =
  exports.createFanoutLambda =
  exports.createMutationLambda =
  exports.createEntityQueryLambda =
  exports.createLambdaLayer =
    void 0;
const aws_cdk_lib_1 = require('aws-cdk-lib');
const aws_cdk_lib_2 = require('aws-cdk-lib');
const aws_cdk_lib_3 = require('aws-cdk-lib');
const aws_cdk_lib_4 = require('aws-cdk-lib');
const aws_sns_subscriptions_1 = require('aws-cdk-lib/aws-sns-subscriptions');
const createLambdaLayer = (construct, layerPath) => {
  return new aws_cdk_lib_1.aws_lambda.LayerVersion(construct, 'BaseLayer', {
    code: aws_cdk_lib_1.aws_lambda.Code.fromAsset(layerPath),
    compatibleRuntimes: [aws_cdk_lib_1.aws_lambda.Runtime.JAVA_21],
    description: 'A layer for Java dependencies',
  });
};
exports.createLambdaLayer = createLambdaLayer;
const createEntityQueryLambda = (
  entityName,
  handlerPath,
  handler, // Example 'com.example.MyLambdaHandler::handleRequest'
  construct,
  eventsTable,
  snapshotsTable,
  layer
) => {
  // Create the Java Lambda function
  const lambdaFunction = new aws_cdk_lib_1.aws_lambda.Function(
    construct,
    `${entityName}QueryLambda`,
    {
      runtime: aws_cdk_lib_1.aws_lambda.Runtime.JAVA_21,
      code: aws_cdk_lib_1.aws_lambda.Code.fromAsset(handlerPath), // Path to the Lambda code, should be a jar file
      handler: handler, // This should match your actual handler method
      environment: {
        EVENTS_TABLE_NAME: eventsTable.tableName,
        SNAPSHOTS_TABLE_NAME: snapshotsTable.tableName,
        ENTITY_NAME: entityName,
      },
      timeout: aws_cdk_lib_1.Duration.seconds(300),
      layers: [layer],
    }
  );
  // Define the IAM policy statement that allows read and write access to the DynamoDB table
  // TODO reduce scope to append only since this table is immutable
  const policyStatement = new aws_cdk_lib_2.aws_iam.PolicyStatement({
    actions: [
      'dynamodb:GetItem',
      'dynamodb:PutItem',
      'dynamodb:UpdateItem',
      'dynamodb:Query',
      'dynamodb:Scan',
      'dynamodb:DeleteItem',
    ],
    resources: [eventsTable.tableArn, snapshotsTable.tableArn],
  });
  lambdaFunction.addToRolePolicy(policyStatement);
  return lambdaFunction;
};
exports.createEntityQueryLambda = createEntityQueryLambda;
const createMutationLambda = (
  entityName,
  mutationName, // Example: Creator, Deactivator, Updator
  handlerPath,
  handler, // Example 'com.example.MyLambdaHandler::handleRequest'
  construct,
  eventsTable,
  snapshotsTable,
  layer
) => {
  // Create the Java Lambda function
  const lambdaFunction = new aws_cdk_lib_1.aws_lambda.Function(
    construct,
    `${entityName}${mutationName}Lambda`,
    {
      runtime: aws_cdk_lib_1.aws_lambda.Runtime.JAVA_21,
      code: aws_cdk_lib_1.aws_lambda.Code.fromAsset(handlerPath), // Path to the Lambda code, should be a jar file
      handler: handler, // This should match your actual handler method
      environment: {
        EVENTS_TABLE_NAME: eventsTable.tableName,
        SNAPSHOTS_TABLE_NAME: snapshotsTable.tableName,
        ENTITY_NAME: entityName,
      },
      timeout: aws_cdk_lib_1.Duration.seconds(300),
      layers: [layer],
    }
  );
  // Define the IAM policy statement that allows read and write access to the DynamoDB table
  // TODO reduce scope to append only since this table is immutable
  const policyStatement = new aws_cdk_lib_2.aws_iam.PolicyStatement({
    actions: [
      'dynamodb:GetItem',
      'dynamodb:PutItem',
      'dynamodb:UpdateItem',
      'dynamodb:Query',
      'dynamodb:Scan',
      'dynamodb:DeleteItem',
    ],
    resources: [eventsTable.tableArn, snapshotsTable.tableArn],
  });
  lambdaFunction.addToRolePolicy(policyStatement);
  return lambdaFunction;
};
exports.createMutationLambda = createMutationLambda;
const createFanoutLambda = (
  entityName,
  handlerPath,
  handler, // Example 'com.example.MyLambdaHandler::handleRequest'
  snsTopic,
  construct,
  eventsTable,
  snapshotsTable,
  layer
) => {
  const lambdaName = `${entityName}FanoutConsumer`;
  const fanoutLambda = new aws_cdk_lib_1.aws_lambda.Function(
    construct,
    lambdaName,
    {
      runtime: aws_cdk_lib_1.aws_lambda.Runtime.JAVA_21,
      code: aws_cdk_lib_1.aws_lambda.Code.fromAsset(handlerPath),
      handler: handler,
      environment: {
        TOPIC_ARN: snsTopic.topicArn,
        EVENTS_TABLE_NAME: eventsTable.tableName,
        SNAPSHOTS_TABLE_NAME: snapshotsTable.tableName,
        ENTITY_NAME: entityName,
      },
      timeout: aws_cdk_lib_1.Duration.seconds(300),
      layers: [layer],
    }
  );
  // Grant the Lambda function permission to read from the DynamoDB Stream
  eventsTable.grantStreamRead(fanoutLambda);
  // Grant the Lambda function permission to publish to the SNS topic
  snsTopic.grantPublish(fanoutLambda);
  // Add event source mapping for DynamoDB Stream
  if (eventsTable.tableStreamArn) {
    fanoutLambda.addEventSourceMapping(`${entityName}StreamMapping`, {
      eventSourceArn: eventsTable.tableStreamArn,
      startingPosition: aws_cdk_lib_1.aws_lambda.StartingPosition.TRIM_HORIZON, // Process records from the oldest available
    });
  }
  const policyStatement = new aws_cdk_lib_2.aws_iam.PolicyStatement({
    actions: [
      'dynamodb:GetItem',
      'dynamodb:PutItem',
      'dynamodb:UpdateItem',
      'dynamodb:Query',
      'dynamodb:Scan',
      'dynamodb:DeleteItem',
    ],
    resources: [eventsTable.tableArn, snapshotsTable.tableArn],
  });
  fanoutLambda.addToRolePolicy(policyStatement);
  return fanoutLambda;
};
exports.createFanoutLambda = createFanoutLambda;
const createSnapshotPopulatorLambda = (
  entityName,
  handlerPath,
  handler, // Example 'com.example.MyLambdaHandler::handleRequest'
  snsTopic,
  construct,
  snapshotsTable,
  layer
) => {
  const queue = new aws_cdk_lib_3.aws_sqs.Queue(
    construct,
    `${entityName}SnapshotPopulatorQueue`,
    {
      fifo: true,
      queueName: `${entityName}SnapshotPopulatorQueue.fifo`,
      contentBasedDeduplication: true,
    }
  );
  snsTopic.addSubscription(new aws_sns_subscriptions_1.SqsSubscription(queue));
  // Lambda function name derived from entity name
  const lambdaName = `${entityName}SnapshotPopulator`;
  const snapshotLambda = new aws_cdk_lib_1.aws_lambda.Function(
    construct,
    lambdaName,
    {
      runtime: aws_cdk_lib_1.aws_lambda.Runtime.JAVA_21,
      code: aws_cdk_lib_1.aws_lambda.Code.fromAsset(handlerPath),
      handler: handler,
      environment: {
        SNAPSHOTS_TABLE_NAME: snapshotsTable.tableName,
        ENTITY_NAME: entityName,
      },
      timeout: aws_cdk_lib_1.Duration.seconds(300),
      layers: [layer],
    }
  );
  snapshotsTable.grantWriteData(snapshotLambda);
  const sqsEventSource =
    new aws_cdk_lib_4.aws_lambda_event_sources.SqsEventSource(queue);
  snapshotLambda.addEventSource(sqsEventSource);
  return snapshotLambda;
};
exports.createSnapshotPopulatorLambda = createSnapshotPopulatorLambda;
