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
exports.createLambda = void 0;
const aws_cdk_lib_1 = require('aws-cdk-lib');
const cdk = __importStar(require('aws-cdk-lib'));
const createLambda = (
  id,
  name,
  runtime,
  codeAssetFullPathWithFileName,
  handler,
  timeout,
  memory,
  role,
  environmentVariables,
  stage,
  construct
) => {
  return new aws_cdk_lib_1.aws_lambda.Function(construct, `${id}-${stage}`, {
    functionName: `${name}-${stage}`,
    runtime: runtime,
    code: aws_cdk_lib_1.aws_lambda.Code.fromAsset(
      codeAssetFullPathWithFileName
    ),
    handler: handler,
    timeout: cdk.Duration.minutes(timeout),
    memorySize: memory,
    role: role,
    environment: environmentVariables,
  });
};
exports.createLambda = createLambda;
