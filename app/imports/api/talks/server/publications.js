import {Meteor} from 'meteor/meteor';
import {Talks} from '../talks.js';

Meteor.publish('talks.user', x => {
  check(x, String);
  return Talks.find({userId: x}).cursor;
});

Meteor.publish('talks', session => {
  check(session, String);
  return Talks.find({session: session});
});
