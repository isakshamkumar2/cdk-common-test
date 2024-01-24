import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Effect } from 'aws-cdk-lib/aws-iam';
import {
  GITHUB_ACTIONS_ACTION_KEY,
  GITHUB_ACTIONS_IAM_USER,
  STAGES,
} from './commonConstants';
import {
  attachCustomPolicyToUser,
  createAccessKeyForUser,
  createIAMPolicy,
  createIAMUser,
} from './iamCommons';

export const createIAMPolicyForGitHubActions = (
  construct: Construct
): iam.Policy => {
  return createIAMPolicy(
    'GitHubActionsPolicy',
    'GitHubActionsPolicy',
    [
      'ec2:RunInstances',
      'ec2:DescribeInstances',
      'ec2:StopInstances',
      'ec2:StartInstances',
      'ec2:ModifyInstanceAttribute',
      'ec2:TerminateInstances',
      'ec2:CreateTags',
      'ec2:DescribeAvailabilityZones',
      'cloudformation:DescribeStacks',
      'ssm:GetParameter',
      'cloudformation:GetTemplate',
      'sts:assumeRole',
    ],
    ['*'],
    Effect.ALLOW,
    STAGES.PROD,
    construct
  );
};

export const createIAMUserForGitHubActions = (
  envName: string,
  construct: Construct
): iam.User => {
  return createIAMUser(
    GITHUB_ACTIONS_IAM_USER,
    `${GITHUB_ACTIONS_IAM_USER}-${envName}`,
    construct
  );
};

export const setupGitHubActionsForCDKDeployment = (
  envName: string,
  construct: Construct
): iam.CfnAccessKey => {
  const ghPolicy: iam.Policy = createIAMPolicyForGitHubActions(construct);
  const ghUser: iam.User = createIAMUserForGitHubActions(envName, construct);
  attachCustomPolicyToUser(ghUser, ghPolicy);
  return createAccessKeyForUser(
    ghUser,
    `${GITHUB_ACTIONS_ACTION_KEY}-${envName}`,
    construct
  );
};
