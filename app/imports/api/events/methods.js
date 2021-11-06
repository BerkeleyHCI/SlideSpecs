import { ValidatedMethod } from "meteor/mdg:validated-method";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { Events } from "./events.js";

export const logEvent = new ValidatedMethod({
    name: "events.create",
    validate: new SimpleSchema({
        data: { type: String },
        talk: { type: String, optional: true },
        type: { type: String, optional: true },
        comment: { type: String, optional: true },
        reviewer: { type: String, optional: true },
    }).validator(),
    run(args) {
        const log = { created: Date.now(), ...args };
        console.log({ type: "event", ...log });
        return Events.insert(log);
    },
});

export const logBlob = (blob) => {
    const data = JSON.stringify(blob);
    const log = { created: Date.now(), data };
    return Events.insert(log);
};

export const deleteEvent = new ValidatedMethod({
    name: "events.delete",
    validate: new SimpleSchema({
        eventId: { type: String },
    }).validator(),
    run({ eventId }) {
        Events.remove({ _id: eventId });
    },
});
