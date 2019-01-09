import {Meteor} from 'meteor/meteor';
import {Talks} from '../talks.js';

Meteor.publish('talks', session => {
  check(session, String);
  if (!session) {
    return this.ready();
  } else {
    return Talks.find({session: session});
  }
});
