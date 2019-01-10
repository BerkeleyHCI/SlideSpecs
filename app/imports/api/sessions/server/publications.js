import {Meteor} from 'meteor/meteor';
import {Sessions} from '../sessions.js';

Meteor.publish('sessions.all', x => {
  check(x, String);
  return Sessions.find({});
});

Meteor.publish('sessions.user', x => {
  check(x, String);
  return Sessions.find({userId: x}).cursor;
});

Meteor.publish('sessions.session', x => {
  check(x, String);
  return {};
});

Meteor.publish('sessions.talk', x => {
  check(x, String);
  return {};
});
