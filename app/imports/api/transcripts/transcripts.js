import { Mongo } from "meteor/mongo";
import { SimpleSchema } from "meteor/aldeed:simple-schema";

export const Transcripts = new Mongo.Collection("Transcripts");

// Deny all client-side updates since we use methods to manage this collection

Transcripts.deny({
    insert() {
        return true;
    },
    update() {
        return true;
    },
    remove() {
        return true;
    },
});

export const wordSchema = new SimpleSchema({
    word: { type: String },
    startTime: { type: Number, optional: true, defaultValue: 0, decimal: true },
    endTime: { type: Number, optional: true, defaultValue: 0, decimal: true },
});

Transcripts.schema = new SimpleSchema({
    created: { type: Date },
    talk: { type: SimpleSchema.RegEx.Id },
    transcript: { type: String },
    results: { type: [wordSchema], optional: true, defaultValue: [] },
    confidence: {
        type: Number,
        optional: true,
        defaultValue: 0,
        decimal: true,
    },
});

Transcripts.attachSchema(Transcripts.schema);
