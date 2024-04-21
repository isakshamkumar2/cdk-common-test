import { aws_lambda as lambda } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';
import { aws_dynamodb as dynamodb } from 'aws-cdk-lib';
import { aws_sns as sns } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_lambda_event_sources as lambdaEventSources } from 'aws-cdk-lib';

export const createEntityQueryLambda = (
  entityName: string,
  handlerPath: string,
  handler: string, // Example 'com.example.MyLambdaHandler::handleRequest'
  construct: Construct
): lambda.Function => {
  // Assume the DynamoDB table is already created with the naming convention
  const eventsTableName = `${entityName}Events`;
  const eventsTable = dynamodb.Table.fromTableAttributes(
    construct,
    `${entityName}Events`,
    {
      tableName: eventsTableName,
    }
  );

  const snapshotsTableName = `${entityName}Snapshots`;

  const snapshotsTable = dynamodb.Table.fromTableAttributes(
    construct,
    `${entityName}Snapshots`,
    {
      tableName: snapshotsTableName,
    }
  );

  // Create the Java Lambda function
  const lambdaFunction = new lambda.Function(
    construct,
    `${entityName}QueryLambda`,
    {
      runtime: lambda.Runtime.JAVA_21,
      code: lambda.Code.fromAsset(handlerPath), // Path to the Lambda code, should be a jar file
      handler: handler, // This should match your actual handler method
      environment: {
        TABLE_NAME: eventsTable.tableName,
      },
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
  construct: Construct
): lambda.Function => {
  // Assume the DynamoDB table is already created with the naming convention
  const eventsTableName = `${entityName}Events`;
  const eventsTable = dynamodb.Table.fromTableAttributes(
    construct,
    `${entityName}Events`,
    {
      tableName: eventsTableName,
    }
  );

  const snapshotsTableName = `${entityName}Snapshots`;

  const snapshotsTable = dynamodb.Table.fromTableAttributes(
    construct,
    `${entityName}Snapshots`,
    {
      tableName: snapshotsTableName,
    }
  );

  // Create the Java Lambda function
  const lambdaFunction = new lambda.Function(
    construct,
    `${entityName}${mutationName}Lambda`,
    {
      runtime: lambda.Runtime.JAVA_21,
      code: lambda.Code.fromAsset(handlerPath), // Path to the Lambda code, should be a jar file
      handler: handler, // This should match your actual handler method
      environment: {
        TABLE_NAME: eventsTable.tableName,
      },
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
  fanoutTopicArn: string,
  construct: Construct
): lambda.Function => {
  const tableName = `${entityName}Events`;

  // Retrieve the existing DynamoDB table and SNS topic by their names
  const entityEventsTable = dynamodb.Table.fromTableAttributes(
    construct,
    `${entityName}Events`,
    {
      tableName: tableName,
    }
  );
  const snsTopic = sns.Topic.fromTopicArn(
    construct,
    `${entityName}FanoutStream`,
    fanoutTopicArn
  );

  const lambdaName = `${entityName}FanoutConsumer`;

  const fanoutLambda = new lambda.Function(construct, lambdaName, {
    runtime: lambda.Runtime.JAVA_21,
    code: lambda.Code.fromAsset(handlerPath),
    handler: handler,
    environment: {
      TOPIC_ARN: snsTopic.topicArn,
      TABLE_NAME: entityEventsTable.tableName,
    },
  });

  // Grant the Lambda function permission to read from the DynamoDB Stream
  entityEventsTable.grantStreamRead(fanoutLambda);

  // Grant the Lambda function permission to publish to the SNS topic
  snsTopic.grantPublish(fanoutLambda);

  // Add event source mapping for DynamoDB Stream
  if (entityEventsTable.tableStreamArn) {
    fanoutLambda.addEventSourceMapping(`${entityName}StreamMapping`, {
      eventSourceArn: entityEventsTable.tableStreamArn,
      startingPosition: lambda.StartingPosition.TRIM_HORIZON, // Process records from the oldest available
    });
  }

  return fanoutLambda;
};

export const createSnapshotPopulatorLambda = (
  entityName: string,
  handlerPath: string,
  handler: string, // Example 'com.example.MyLambdaHandler::handleRequest'
  snsTopicArn: string,
  construct: Construct
): lambda.Function => {
  // Infer the DynamoDB table name for snapshots
  const tableName = `${entityName}Snapshots`;

  // Retrieve the existing DynamoDB table by table name
  const snapshotsTable = dynamodb.Table.fromTableAttributes(
    construct,
    `${entityName}Snapshots`,
    {
      tableName: tableName,
    }
  );

  // Retrieve the existing SNS topic by ARN
  const snsTopic = sns.Topic.fromTopicArn(
    construct,
    `${entityName}FanoutStream`,
    snsTopicArn
  );

  // Lambda function name derived from entity name
  const lambdaName = `${entityName}SnapshotPopulator`;

  const snapshotLambda = new lambda.Function(construct, lambdaName, {
    runtime: lambda.Runtime.JAVA_21,
    code: lambda.Code.fromAsset(handlerPath),
    handler: handler,
    environment: {
      TABLE_NAME: snapshotsTable.tableName,
    },
  });

  snapshotsTable.grantWriteData(snapshotLambda);

  const snsEventSource = new lambdaEventSources.SnsEventSource(snsTopic);

  snapshotLambda.addEventSource(snsEventSource);

  return snapshotLambda;
};
