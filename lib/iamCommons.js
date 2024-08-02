"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPolicyStatement = exports.attachManagedPolicyToRole = exports.attachCustomPolicyStatementsToRole = exports.createIAMRole = exports.createIAMPolicy = exports.createAccessKeyForUser = exports.attachCustomPolicyToUser = exports.attachManagedPolicyNameToUser = exports.createIAMUser = void 0;
const iam = __importStar(require("aws-cdk-lib/aws-iam"));
const createIAMUser = (userName, id, construct) => {
    return new iam.User(construct, id, { userName });
};
exports.createIAMUser = createIAMUser;
const attachManagedPolicyNameToUser = (user, managedPolicyName) => {
    user.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName(managedPolicyName));
};
exports.attachManagedPolicyNameToUser = attachManagedPolicyNameToUser;
const attachCustomPolicyToUser = (user, policy) => {
    user.attachInlinePolicy(policy);
};
exports.attachCustomPolicyToUser = attachCustomPolicyToUser;
const createAccessKeyForUser = (user, accessKeyId, construct) => {
    return new iam.CfnAccessKey(construct, accessKeyId, {
        userName: user.userName,
    });
};
exports.createAccessKeyForUser = createAccessKeyForUser;
const createIAMPolicy = (policyName, policyId, policyActions, policyResources, policyEffect, stage, construct) => {
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
exports.createIAMPolicy = createIAMPolicy;
const createIAMRole = (roleName, roleId, servicePrincipal, stage, construct) => {
    return new iam.Role(construct, `${roleId}-${stage}`, {
        roleName: `${roleName}-${stage}`,
        assumedBy: servicePrincipal,
    });
};
exports.createIAMRole = createIAMRole;
const attachCustomPolicyStatementsToRole = (role, policyStatements) => {
    policyStatements.forEach((policyStatement) => {
        role.addToPolicy(policyStatement);
    });
};
exports.attachCustomPolicyStatementsToRole = attachCustomPolicyStatementsToRole;
const attachManagedPolicyToRole = (role, managedPolicyName) => {
    role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName(managedPolicyName));
};
exports.attachManagedPolicyToRole = attachManagedPolicyToRole;
const createPolicyStatement = (policyActions, policyResources) => {
    return new iam.PolicyStatement({
        actions: policyActions,
        resources: policyResources,
    });
};
exports.createPolicyStatement = createPolicyStatement;
