import {Meteor} from 'meteor/meteor';
import {Talks} from '../talks.js';

Meteor.publish('talks.user', x => {
  check(x, String);
  return Talks.find({userId: x});
});

Meteor.publish('talks.session', x => {
  check(x, String);
  return Talks.find({session: x});
});

Meteor.publish('talks.talk', x => {
  check(x, String);
  return Talks.find({_id: x});
});
