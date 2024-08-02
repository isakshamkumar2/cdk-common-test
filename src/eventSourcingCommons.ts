import { aws_dynamodb as dynamodb } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { TableV2 } from 'aws-cdk-lib/aws-dynamodb';

export const createEventsTable = (
  entityName: string,
  construct: Construct
): TableV2 => {
  return new dynamodb.TableV2(construct, entityName + 'Events', {
    tableName: entityName + 'Events',
    partitionKey: { name: 'entityId', type: dynamodb.AttributeType.STRING },
    sortKey: { name: 'version', type: dynamodb.AttributeType.NUMBER },
    globalSecondaryIndexes: [
      {
        indexName: 'ModifiedByIndex',
        partitionKey: {
          name: 'modifiedBy',
          type: dynamodb.AttributeType.STRING,
        },
        sortKey: { name: 'version', type: dynamodb.AttributeType.NUMBER },
      },
    ],
    billing: dynamodb.Billing.provisioned({
      // The read and write capacity is set to take advantage of the DynamoDB Free Tier
      // This is needed to be revisited in the future when traffic patterns change and we run out of free tier
      readCapacity: dynamodb.Capacity.fixed(25),
      writeCapacity: dynamodb.Capacity.autoscaled({ maxCapacity: 25 }),
    }),
    contributorInsights: true,
    tableClass: dynamodb.TableClass.STANDARD,
    deletionProtection: true,
    dynamoStream: dynamodb.StreamViewType.NEW_IMAGE,
  });
};

export const createSnapshotsTable = (
  entityName: string,
  construct: Construct
): TableV2 => {
  return new dynamodb.TableV2(construct, entityName + 'Snapshots', {
    tableName: entityName + 'Snapshots',
    partitionKey: { name: 'entityId', type: dynamodb.AttributeType.STRING },
    sortKey: { name: 'version', type: dynamodb.AttributeType.NUMBER },
    globalSecondaryIndexes: [
      {
        indexName: 'ModifiedByIndex',
        partitionKey: {
          name: 'modifiedBy',
          type: dynamodb.AttributeType.STRING,
        },
        sortKey: { name: 'version', type: dynamodb.AttributeType.NUMBER },
      },
    ],
    // The read and write capacity is set to take advantage of the DynamoDB Free Tier
    // This is needed to be revisited in the future when traffic patterns change and we run out of free tier
    billing: dynamodb.Billing.provisioned({
      readCapacity: dynamodb.Capacity.fixed(25),
      writeCapacity: dynamodb.Capacity.autoscaled({ maxCapacity: 25 }),
    }),
    contributorInsights: true,
    tableClass: dynamodb.TableClass.STANDARD,
    deletionProtection: true,
  });
};