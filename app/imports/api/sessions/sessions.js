import { Mongo } from "meteor/mongo";
import { SimpleSchema } from "meteor/aldeed:simple-schema";

export const Sessions = new Mongo.Collection("Sessions");

Sessions.deny({
    insert() {
        return true;
    },
    // allowing updates for talk order
    // update() { return true; },
    remove() {
        return true;
    },
});

Sessions.schema = new SimpleSchema({
    name: { type: String },
    created: { type: Date },
    talks: { type: [String] },
    secret: { type: String, regEx: SimpleSchema.RegEx.Id },
    userId: { type: String, regEx: SimpleSchema.RegEx.Id },
});

Sessions.attachSchema(Sessions.schema);
