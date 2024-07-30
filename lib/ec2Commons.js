'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.attachSSMPolicyToEC2Instance =
  exports.createAndAssignDefaultElasticIp =
  exports.createDefaultEc2Instance =
  exports.createDefaultSecurityGroup =
  exports.createDefaultVpc =
    void 0;
const ec2 = __importStar(require('aws-cdk-lib/aws-ec2'));
const iamCommons_1 = require('./iamCommons');
const commonConstants_1 = require('./commonConstants');
const createDefaultVpc = (
  vpcId,
  vpcName,
  maxAzs,
  construct,
  stage,
  isPublic = true
) => {
  return new ec2.Vpc(construct, `${vpcId}`, {
    vpcName: `${vpcName}-${stage}`,
    maxAzs: maxAzs,
    subnetConfiguration: [
      {
        name: `${vpcName}-${stage}-SubnetConfig`,
        subnetType: isPublic
          ? ec2.SubnetType.PUBLIC
          : ec2.SubnetType.PRIVATE_WITH_EGRESS,
        // This determines whether EC2 instance will have access to public internet or not
      },
    ],
  });
};
exports.createDefaultVpc = createDefaultVpc;
const createDefaultSecurityGroup = (
  securityGroupId,
  securityGroupName,
  vpc,
  securityGroupDescription,
  stage,
  construct
) => {
  return new ec2.SecurityGroup(construct, `${securityGroupId}`, {
    securityGroupName: `${securityGroupName}-${stage}`,
    vpc: vpc,
    description: securityGroupDescription,
    allowAllOutbound: true,
  });
};
exports.createDefaultSecurityGroup = createDefaultSecurityGroup;
const createDefaultEc2Instance = (
  ec2InstanceId,
  ec2InstanceName,
  instanceType,
  machineImage,
  vpc,
  securityGroup,
  userDataContent,
  region,
  stage,
  construct
) => {
  const genericLinuxImage = new ec2.GenericLinuxImage({
    [region]: machineImage,
  });
  const userDataScript = ec2.UserData.custom(userDataContent);
  return new ec2.Instance(construct, `${ec2InstanceId}-${stage}`, {
    instanceType: new ec2.InstanceType(instanceType),
    instanceName: `${ec2InstanceName}-${stage}`,
    machineImage: genericLinuxImage,
    vpc: vpc,
    securityGroup: securityGroup,
    userData: userDataScript,
  });
};
exports.createDefaultEc2Instance = createDefaultEc2Instance;
const createAndAssignDefaultElasticIp = (
  eipName,
  ec2Instance,
  stage,
  construct
) => {
  const eip = new ec2.CfnEIP(construct, `${eipName}`);
  new ec2.CfnEIPAssociation(construct, `${eipName}-${stage}-EIPAssociation`, {
    eip: eip.ref,
    instanceId: ec2Instance.instanceId,
  });
};
exports.createAndAssignDefaultElasticIp = createAndAssignDefaultElasticIp;
/**
 * Method to allow ssh into EC2 instances by attaching Session Manager Policy
 * @param instance
 */
const attachSSMPolicyToEC2Instance = (instance) => {
  (0, iamCommons_1.attachManagedPolicyToRole)(
    instance.role,
    commonConstants_1.MANAGED_POLICIES.SSM_MANAGED_INSTANCE_CORE
  );
};
exports.attachSSMPolicyToEC2Instance = attachSSMPolicyToEC2Instance;
