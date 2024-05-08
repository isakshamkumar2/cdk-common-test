import {
  createEventsTable,
  createSnapshotsTable,
} from './eventSourcingCommons';
import { Construct } from 'constructs';
import {
  createFanoutTopic,
  createReplayFanoutTopic,
} from './eventSourcingStreamCommons';

export const createEventSourcingInfra = (
  entityName: string,
  construct: Construct
) => {
  createEventsTable(entityName, construct);
  createSnapshotsTable(entityName, construct);
  createFanoutTopic(entityName, construct);
  createReplayFanoutTopic(entityName, construct);
};
