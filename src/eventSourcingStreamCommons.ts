import { aws_sns as sns } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export const createFanoutTopic = (
  entityName: string,
  construct: Construct
): sns.Topic => {
  const topicName = `${entityName}FanoutStream`;

  const topic = new sns.Topic(construct, `${entityName}FanoutTopic`, {
    topicName: topicName,
    fifo: true,
  });

  return topic;
};

export const createReplayFanoutTopic = (
  entityName: string,
  construct: Construct
): sns.Topic => {
  const topicName = `${entityName}ReplayedFanoutStream`;

  const topic = new sns.Topic(construct, `${entityName}ReplayedFanoutTopic`, {
    topicName: topicName,
    fifo: true,
  });

  return topic;
};
