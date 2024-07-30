'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.createSnapshotsTable = exports.createEventsTable = void 0;
const aws_cdk_lib_1 = require('aws-cdk-lib');
const createEventsTable = (entityName, construct) => {
  return new aws_cdk_lib_1.aws_dynamodb.TableV2(
    construct,
    entityName + 'Events',
    {
      tableName: entityName + 'Events',
      partitionKey: {
        name: 'entityId',
        type: aws_cdk_lib_1.aws_dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'version',
        type: aws_cdk_lib_1.aws_dynamodb.AttributeType.NUMBER,
      },
      globalSecondaryIndexes: [
        {
          indexName: 'ModifiedByIndex',
          partitionKey: {
            name: 'modifiedBy',
            type: aws_cdk_lib_1.aws_dynamodb.AttributeType.STRING,
          },
          sortKey: {
            name: 'version',
            type: aws_cdk_lib_1.aws_dynamodb.AttributeType.NUMBER,
          },
        },
      ],
      billing: aws_cdk_lib_1.aws_dynamodb.Billing.provisioned({
        // The read and write capacity is set to take advantage of the DynamoDB Free Tier
        // This is needed to be revisited in the future when traffic patterns change and we run out of free tier
        readCapacity: aws_cdk_lib_1.aws_dynamodb.Capacity.fixed(25),
        writeCapacity: aws_cdk_lib_1.aws_dynamodb.Capacity.autoscaled({
          maxCapacity: 25,
        }),
      }),
      contributorInsights: true,
      tableClass: aws_cdk_lib_1.aws_dynamodb.TableClass.STANDARD,
      deletionProtection: true,
      dynamoStream: aws_cdk_lib_1.aws_dynamodb.StreamViewType.NEW_IMAGE,
    }
  );
};
exports.createEventsTable = createEventsTable;
const createSnapshotsTable = (entityName, construct) => {
  return new aws_cdk_lib_1.aws_dynamodb.TableV2(
    construct,
    entityName + 'Snapshots',
    {
      tableName: entityName + 'Snapshots',
      partitionKey: {
        name: 'entityId',
        type: aws_cdk_lib_1.aws_dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'version',
        type: aws_cdk_lib_1.aws_dynamodb.AttributeType.NUMBER,
      },
      globalSecondaryIndexes: [
        {
          indexName: 'ModifiedByIndex',
          partitionKey: {
            name: 'modifiedBy',
            type: aws_cdk_lib_1.aws_dynamodb.AttributeType.STRING,
          },
          sortKey: {
            name: 'version',
            type: aws_cdk_lib_1.aws_dynamodb.AttributeType.NUMBER,
          },
        },
      ],
      // The read and write capacity is set to take advantage of the DynamoDB Free Tier
      // This is needed to be revisited in the future when traffic patterns change and we run out of free tier
      billing: aws_cdk_lib_1.aws_dynamodb.Billing.provisioned({
        readCapacity: aws_cdk_lib_1.aws_dynamodb.Capacity.fixed(25),
        writeCapacity: aws_cdk_lib_1.aws_dynamodb.Capacity.autoscaled({
          maxCapacity: 25,
        }),
      }),
      contributorInsights: true,
      tableClass: aws_cdk_lib_1.aws_dynamodb.TableClass.STANDARD,
      deletionProtection: true,
    }
  );
};
exports.createSnapshotsTable = createSnapshotsTable;
