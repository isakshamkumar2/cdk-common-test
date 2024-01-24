import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { attachManagedPolicyToRole } from './iamCommons';
import { MANAGED_POLICIES, STAGES } from './commonConstants';

export const createDefaultVpc = (
  vpcId: string,
  vpcName: string,
  maxAzs: number,
  construct: Construct,
  stage: STAGES,
  isPublic: boolean = true
): ec2.Vpc => {
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

export const createDefaultSecurityGroup = (
  securityGroupId: string,
  securityGroupName: string,
  vpc: ec2.Vpc,
  securityGroupDescription: string,
  stage: STAGES,
  construct: Construct
): ec2.SecurityGroup => {
  return new ec2.SecurityGroup(construct, `${securityGroupId}`, {
    securityGroupName: `${securityGroupName}-${stage}`,
    vpc: vpc,
    description: securityGroupDescription,
    allowAllOutbound: true,
  });
};

export const createDefaultEc2Instance = (
  ec2InstanceId: string,
  ec2InstanceName: string,
  instanceType: string,
  machineImage: string,
  vpc: ec2.Vpc,
  securityGroup: ec2.SecurityGroup,
  userDataContent: string,
  region: string,
  stage: STAGES,
  construct: Construct
): ec2.Instance => {
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

export const createAndAssignDefaultElasticIp = (
  eipName: string,
  ec2Instance: ec2.Instance,
  stage: STAGES,
  construct: Construct
) => {
  const eip = new ec2.CfnEIP(construct, `${eipName}`);
  new ec2.CfnEIPAssociation(construct, `${eipName}-${stage}-EIPAssociation`, {
    eip: eip.ref,
    instanceId: ec2Instance.instanceId,
  });
};

/**
 * Method to allow ssh into EC2 instances by attaching Session Manager Policy
 * @param instance
 */
export const attachSSMPolicyToEC2Instance = (instance: ec2.Instance) => {
  attachManagedPolicyToRole(
    instance.role,
    MANAGED_POLICIES.SSM_MANAGED_INSTANCE_CORE
  );
};
