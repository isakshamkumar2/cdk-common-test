import { LAMBDA_MEMORY, LAMBDA_TIMEOUT, STAGES } from './commonConstants';
import { Construct } from 'constructs';
import { aws_lambda as lambda } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cdk from 'aws-cdk-lib';

export const createLambda = (
  id: string,
  name: string,
  runtime: lambda.Runtime,
  codeAssetFullPathWithFileName: string,
  handler: string,
  timeout: LAMBDA_TIMEOUT,
  memory: LAMBDA_MEMORY,
  role: iam.Role,
  environmentVariables: { [key: string]: string },
  stage: STAGES,
  construct: Construct
): lambda.Function => {
  return new lambda.Function(construct, `${id}-${stage}`, {
    functionName: `${name}-${stage}`,
    runtime: runtime,
    code: lambda.Code.fromAsset(codeAssetFullPathWithFileName),
    handler: handler,
    timeout: cdk.Duration.minutes(timeout),
    memorySize: memory,
    role: role,
    environment: environmentVariables,
  });
};
