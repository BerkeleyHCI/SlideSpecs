import {Meteor} from 'meteor/meteor';
import {Comments} from '../comments.js';

Meteor.publish('comments', session => {
  check(session, String);
  if (!session) {
    return this.ready();
  } else {
    return Comments.find({session: session});
  }
});
