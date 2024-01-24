import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { Effect } from 'aws-cdk-lib/aws-iam';
import { MANAGED_POLICIES, STAGES } from './commonConstants';

export const createIAMUser = (
  userName: string,
  id: string,
  construct: Construct
): iam.User => {
  return new iam.User(construct, id, { userName });
};

export const attachManagedPolicyNameToUser = (
  user: iam.User,
  managedPolicyName: string
) => {
  user.addManagedPolicy(
    iam.ManagedPolicy.fromAwsManagedPolicyName(managedPolicyName)
  );
};

export const attachCustomPolicyToUser = (
  user: iam.User,
  policy: iam.Policy
) => {
  user.attachInlinePolicy(policy);
};

export const createAccessKeyForUser = (
  user: iam.User,
  accessKeyId: string,
  construct: Construct
): iam.CfnAccessKey => {
  return new iam.CfnAccessKey(construct, accessKeyId, {
    userName: user.userName,
  });
};

export const createIAMPolicy = (
  policyName: string,
  policyId: string,
  policyActions: string[],
  policyResources: string[],
  policyEffect: Effect,
  stage: STAGES,
  construct: Construct
): iam.Policy => {
  return new iam.Policy(construct, `${policyId}-${stage}`, {
    policyName: `${policyName}-${stage}`,
    statements: [
      new iam.PolicyStatement({
        effect: policyEffect,
        actions: policyActions,
        resources: policyResources,
      }),
    ],
  });
};

export const createIAMRole = (
  roleName: string,
  roleId: string,
  servicePrincipal: iam.ServicePrincipal,
  stage: STAGES,
  construct: Construct
): iam.Role => {
  return new iam.Role(construct, `${roleId}-${stage}`, {
    roleName: `${roleName}-${stage}`,
    assumedBy: servicePrincipal,
  });
};

export const attachCustomPolicyStatementsToRole = (
  role: iam.Role,
  policyStatements: iam.PolicyStatement[]
) => {
  policyStatements.forEach((policyStatement) => {
    role.addToPolicy(policyStatement);
  });
};

export const attachManagedPolicyToRole = (
  role: iam.IRole,
  managedPolicyName: MANAGED_POLICIES
) => {
  role.addManagedPolicy(
    iam.ManagedPolicy.fromAwsManagedPolicyName(managedPolicyName)
  );
};

export const createPolicyStatement = (
  policyActions: string[],
  policyResources: string[]
): iam.PolicyStatement => {
  return new iam.PolicyStatement({
    actions: policyActions,
    resources: policyResources,
  });
};
