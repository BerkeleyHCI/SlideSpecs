import { Meteor } from "meteor/meteor";
import { Sessions } from "../sessions.js";
import { Talks } from "../../talks/talks.js";

Meteor.publish("sessions.user", (x) => {
    check(x, String);
    return Sessions.find({ userId: x });
});

Meteor.publish("sessions.session", (x) => {
    check(x, String);
    return Sessions.find({ _id: x });
});

Meteor.publish("sessions.talk", (x) => {
    check(x, String);
    const ref = Talks.findOne(x) || {};
    return Sessions.find(ref.session);
});
