import { Duration, aws_lambda as lambda } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';
import { aws_dynamodb as dynamodb } from 'aws-cdk-lib';
import { aws_sns as sns } from 'aws-cdk-lib';
import { aws_sqs as sqs } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_lambda_event_sources as lambdaEventSources } from 'aws-cdk-lib';
import { SqsSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';

export const createLambdaLayer = (construct: Construct, layerPath: string) => {
  return new lambda.LayerVersion(construct, 'BaseLayer', {
    code: lambda.Code.fromAsset(layerPath),
    compatibleRuntimes: [lambda.Runtime.JAVA_21],
    description: 'A layer for Java dependencies',
  });
};

export const createEntityQueryLambda = (
  entityName: string,
  handlerPath: string,
  handler: string, // Example 'com.example.MyLambdaHandler::handleRequest'
  construct: Construct,
  eventsTable: dynamodb.TableV2,
  snapshotsTable: dynamodb.TableV2,
  layer: lambda.LayerVersion
): lambda.Function => {
  // Create the Java Lambda function
  const lambdaFunction = new lambda.Function(
    construct,
    `${entityName}QueryLambda`,
    {
      runtime: lambda.Runtime.JAVA_21,
      code: lambda.Code.fromAsset(handlerPath), // Path to the Lambda code, should be a jar file
      handler: handler, // This should match your actual handler method
      environment: {
        EVENTS_TABLE_NAME: eventsTable.tableName,
        SNAPSHOTS_TABLE_NAME: snapshotsTable.tableName,
        ENTITY_NAME: entityName,
      },
      timeout: Duration.seconds(300),
      layers: [layer],
    }
  );

  // Define the IAM policy statement that allows read and write access to the DynamoDB table
  // TODO reduce scope to append only since this table is immutable
  const policyStatement = new iam.PolicyStatement({
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

export const createMutationLambda = (
  entityName: string,
  mutationName: string, // Example: Creator, Deactivator, Updator
  handlerPath: string,
  handler: string, // Example 'com.example.MyLambdaHandler::handleRequest'
  construct: Construct,
  eventsTable: dynamodb.TableV2,
  snapshotsTable: dynamodb.TableV2,
  layer: lambda.LayerVersion
): lambda.Function => {
  // Create the Java Lambda function
  const lambdaFunction = new lambda.Function(
    construct,
    `${entityName}${mutationName}Lambda`,
    {
      runtime: lambda.Runtime.JAVA_21,
      code: lambda.Code.fromAsset(handlerPath), // Path to the Lambda code, should be a jar file
      handler: handler, // This should match your actual handler method
      environment: {
        EVENTS_TABLE_NAME: eventsTable.tableName,
        SNAPSHOTS_TABLE_NAME: snapshotsTable.tableName,
        ENTITY_NAME: entityName,
      },
      timeout: Duration.seconds(300),
      layers: [layer],
    }
  );

  // Define the IAM policy statement that allows read and write access to the DynamoDB table
  // TODO reduce scope to append only since this table is immutable
  const policyStatement = new iam.PolicyStatement({
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

export const createFanoutLambda = (
  entityName: string,
  handlerPath: string,
  handler: string, // Example 'com.example.MyLambdaHandler::handleRequest'
  snsTopic: sns.Topic,
  construct: Construct,
  eventsTable: dynamodb.TableV2,
  snapshotsTable: dynamodb.TableV2,
  layer: lambda.LayerVersion
): lambda.Function => {
  const lambdaName = `${entityName}FanoutConsumer`;

  const fanoutLambda = new lambda.Function(construct, lambdaName, {
    runtime: lambda.Runtime.JAVA_21,
    code: lambda.Code.fromAsset(handlerPath),
    handler: handler,
    environment: {
      TOPIC_ARN: snsTopic.topicArn,
      EVENTS_TABLE_NAME: eventsTable.tableName,
      SNAPSHOTS_TABLE_NAME: snapshotsTable.tableName,
      ENTITY_NAME: entityName,
    },
    timeout: Duration.seconds(300),
    layers: [layer],
  });

  // Grant the Lambda function permission to read from the DynamoDB Stream
  eventsTable.grantStreamRead(fanoutLambda);

  // Grant the Lambda function permission to publish to the SNS topic
  snsTopic.grantPublish(fanoutLambda);

  // Add event source mapping for DynamoDB Stream
  if (eventsTable.tableStreamArn) {
    fanoutLambda.addEventSourceMapping(`${entityName}StreamMapping`, {
      eventSourceArn: eventsTable.tableStreamArn,
      startingPosition: lambda.StartingPosition.TRIM_HORIZON, // Process records from the oldest available
    });
  }

  const policyStatement = new iam.PolicyStatement({
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

export const createSnapshotPopulatorLambda = (
  entityName: string,
  handlerPath: string,
  handler: string, // Example 'com.example.MyLambdaHandler::handleRequest'
  snsTopic: sns.Topic,
  construct: Construct,
  snapshotsTable: dynamodb.TableV2,
  layer: lambda.LayerVersion
): lambda.Function => {
  const queue = new sqs.Queue(
    construct,
    `${entityName}SnapshotPopulatorQueue`,
    {
      fifo: true,
      queueName: `${entityName}SnapshotPopulatorQueue.fifo`,
      contentBasedDeduplication: true,
    }
  );

  snsTopic.addSubscription(new SqsSubscription(queue));

  // Lambda function name derived from entity name
  const lambdaName = `${entityName}SnapshotPopulator`;

  const snapshotLambda = new lambda.Function(construct, lambdaName, {
    runtime: lambda.Runtime.JAVA_21,
    code: lambda.Code.fromAsset(handlerPath),
    handler: handler,
    environment: {
      SNAPSHOTS_TABLE_NAME: snapshotsTable.tableName,
      ENTITY_NAME: entityName,
    },
    timeout: Duration.seconds(300),
    layers: [layer],
  });

  snapshotsTable.grantWriteData(snapshotLambda);

  const sqsEventSource = new lambdaEventSources.SqsEventSource(queue);

  snapshotLambda.addEventSource(sqsEventSource);

  return snapshotLambda;
};