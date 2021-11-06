import { ValidatedMethod } from "meteor/mdg:validated-method";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { Talks } from "../talks/talks.js";
import { Transcripts, wordSchema } from "./transcripts.js";
import { logBlob } from "../events/methods.js";

export const createTranscript = new ValidatedMethod({
    name: "transcripts.create",
    validate: new SimpleSchema({
        talk: { type: SimpleSchema.RegEx.Id },
        transcript: { type: String },
        results: { type: [wordSchema] },
        confidence: { type: Number, decimal: true },
    }).validator(),
    run({ talk, transcript, results, confidence }) {
        const uTalk = Talks.findOne(talk);
        if (uTalk) {
            logBlob({ type: "creating transcript" });
            const data = {
                created: Date.now(),
                talk,
                transcript,
                results,
                confidence,
            };
            return Transcripts.insert(data);
        } else {
            console.error("Talk data does not match.", talk);
        }
    },
});

export const deleteTranscript = new ValidatedMethod({
    name: "transcripts.delete",
    validate: new SimpleSchema({
        transcriptId: { type: String },
    }).validator(),
    run({ transcriptId }) {
        const transcript = Transcripts.findOne(transcriptId);
        if (transcript && Meteor.user()) {
            // console.log({ type: "transcript.delete", ...transcript });
            Transcripts.remove(transcriptId);
        }
    },
});
