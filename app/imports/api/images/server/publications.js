/* eslint-disable prefer-arrow-callback */
import { Meteor } from "meteor/meteor";
import { Images } from "../images.js";

Images.allowClient();

Meteor.publish("images.user", (x) => {
    check(x, String);
    return Images.find({ "meta.userId": x }).cursor;
});

Meteor.publish("images.session", function (session) {
    check(session, String);
    if (!session) {
        return this.ready();
    } else {
        return Images.find({ "meta.sessionId": session }).cursor;
    }
});

Meteor.publish("images.talk", function (talk) {
    check(talk, String);
    if (!talk) {
        return this.ready();
    } else {
        return Images.find({ "meta.talkId": talk }).cursor;
    }
});
