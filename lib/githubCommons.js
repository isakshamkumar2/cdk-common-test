"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupGitHubActionsForCDKDeployment = exports.createIAMUserForGitHubActions = exports.createIAMPolicyForGitHubActions = void 0;
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
const commonConstants_1 = require("./commonConstants");
const iamCommons_1 = require("./iamCommons");
const createIAMPolicyForGitHubActions = (construct) => {
    return (0, iamCommons_1.createIAMPolicy)('GitHubActionsPolicy', 'GitHubActionsPolicy', [
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
    ], ['*'], aws_iam_1.Effect.ALLOW, commonConstants_1.STAGES.PROD, construct);
};
exports.createIAMPolicyForGitHubActions = createIAMPolicyForGitHubActions;
const createIAMUserForGitHubActions = (envName, construct) => {
    return (0, iamCommons_1.createIAMUser)(commonConstants_1.GITHUB_ACTIONS_IAM_USER, `${commonConstants_1.GITHUB_ACTIONS_IAM_USER}-${envName}`, construct);
};
exports.createIAMUserForGitHubActions = createIAMUserForGitHubActions;
const setupGitHubActionsForCDKDeployment = (envName, construct) => {
    const ghPolicy = (0, exports.createIAMPolicyForGitHubActions)(construct);
    const ghUser = (0, exports.createIAMUserForGitHubActions)(envName, construct);
    (0, iamCommons_1.attachCustomPolicyToUser)(ghUser, ghPolicy);
    return (0, iamCommons_1.createAccessKeyForUser)(ghUser, `${commonConstants_1.GITHUB_ACTIONS_ACTION_KEY}-${envName}`, construct);
};
exports.setupGitHubActionsForCDKDeployment = setupGitHubActionsForCDKDeployment;
