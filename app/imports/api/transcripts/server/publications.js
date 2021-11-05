import { Meteor } from "meteor/meteor";
import { Transcripts } from "../transcripts.js";

Meteor.publish("transcripts.user", (x) => {
    check(x, String);
    return Transcripts.find({ userId: x });
});

Meteor.publish("transcripts.talk", (x) => {
    check(x, String);
    return Transcripts.find({ talk: x });
});
