/* eslint-disable prefer-arrow-callback */
import { Meteor } from "meteor/meteor";
import { Files } from "../files.js";

Files.allowClient();

Meteor.publish("files.user", (x) => {
    check(x, String);
    return Files.find({ "meta.userId": x }).cursor;
});

Meteor.publish("files.session", function (session) {
    check(session, String);
    if (!session) {
        return this.ready();
    } else {
        return Files.find({ "meta.sessionId": session }).cursor;
    }
});

Meteor.publish("files.talk", function (talk) {
    check(talk, String);
    if (!talk) {
        return this.ready();
    } else {
        return Files.find({ "meta.talkId": talk }).cursor;
    }
});
