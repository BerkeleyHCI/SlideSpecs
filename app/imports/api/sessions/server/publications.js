import {Meteor} from 'meteor/meteor';
import {Sessions} from '../sessions.js';

Meteor.publish('sessions.user', user => {
  check(user, String);
  if (!user) {
    return this.ready();
  } else {
    return Sessions.find({userId: user}).cursor;
  }
});

Meteor.publish('sessions.all', () => {
  return Sessions.find({});
});
