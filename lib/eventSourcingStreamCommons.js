"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReplayFanoutTopic = exports.createFanoutTopic = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
const createFanoutTopic = (entityName, construct) => {
    const topicName = `${entityName}FanoutStream`;
    const topic = new aws_cdk_lib_1.aws_sns.Topic(construct, `${entityName}FanoutTopic`, {
        topicName: topicName,
        fifo: true,
        contentBasedDeduplication: true,
    });
    return topic;
};
exports.createFanoutTopic = createFanoutTopic;
const createReplayFanoutTopic = (entityName, construct) => {
    const topicName = `${entityName}ReplayedFanoutStream`;
    const topic = new aws_cdk_lib_1.aws_sns.Topic(construct, `${entityName}ReplayedFanoutTopic`, {
        topicName: topicName,
        fifo: true,
        contentBasedDeduplication: true,
    });
    return topic;
};
exports.createReplayFanoutTopic = createReplayFanoutTopic;
