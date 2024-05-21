"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEventSourcingInfra = void 0;
const eventSourcingCommons_1 = require("./eventSourcingCommons");
const eventSourcingStreamCommons_1 = require("./eventSourcingStreamCommons");
const createEventSourcingInfra = (entityName, construct) => {
    const eventsTable = (0, eventSourcingCommons_1.createEventsTable)(entityName, construct);
    const snapshotsTable = (0, eventSourcingCommons_1.createSnapshotsTable)(entityName, construct);
    (0, eventSourcingStreamCommons_1.createFanoutTopic)(entityName, construct);
    (0, eventSourcingStreamCommons_1.createReplayFanoutTopic)(entityName, construct);
    return [eventsTable, snapshotsTable];
};
exports.createEventSourcingInfra = createEventSourcingInfra;
