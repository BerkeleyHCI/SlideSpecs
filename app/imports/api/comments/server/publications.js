import { Meteor } from "meteor/meteor";
import { Comments } from "../comments.js";

Meteor.publish("comments.user", (x) => {
    check(x, String);
    return Comments.find({ userId: x });
});

Meteor.publish("comments.session", (x) => {
    check(x, String);
    return Comments.find({ session: x });
});

Meteor.publish("comments.talk", (x) => {
    check(x, String);
    return Comments.find({ talk: x });
});
