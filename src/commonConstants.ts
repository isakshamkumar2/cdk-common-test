export const ALLOWED_HTTP_PORT: number = 80;
export const ALLOWED_HTTPS_PORT: number = 443;
export const ALLOWED_LDAP_PORT: number = 389;

export const GITHUB_ACTIONS_IAM_USER: string = 'GitHubActions';
export const GITHUB_ACTIONS_ACTION_KEY: string = 'GitHubActionsActionKey';

export const T2_NANO: string = 't2.nano';
export const UBUNTU_64_X86_AMI: string = 'ami-007855ac798b5175e';

export enum HTTP_METHODS {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
}
export enum HTTP_STATUS_CODES {
  OK = '200',
  Created = '201',
  Accepted = '202',
  NoContent = '204',
  BadRequest = '400',
  Unauthorized = '401',
  Forbidden = '403',
  NotFound = '404',
  InternalServerError = '500',
  NotImplemented = '501',
}

export enum MANAGED_POLICIES {
  STEP_FUNCTIONS_READ_ONLY = 'AWSStepFunctionsReadOnlyAccess',
  SSM_MANAGED_INSTANCE_CORE = 'AmazonSSMManagedInstanceCore',
}

export enum STAGES {
  PROD = 'production',
  BETA = 'development',
  GAMMA = 'pre-prod',
}

export enum LAMBDA_TIMEOUT {
  LAMBDA_TIMEOUT_MAX = 15,
  LAMBDA_TIMEOUT_MEDIUM = 6,
  LAMBDA_TIMEOUT_MIN = 2,
  ONE = 1,
}

export enum LAMBDA_MEMORY {
  LAMBDA_MEMORY_MIN = 128,
  LAMBDA_MEMORY_MAX = 256,
}