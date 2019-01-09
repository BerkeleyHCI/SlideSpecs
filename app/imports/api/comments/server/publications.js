import {Meteor} from 'meteor/meteor';
import {Comments} from '../comments.js';

Meteor.publish('comments', talk => {
  check(talk, String);
  if (!talk) {
    return this.ready();
  } else {
    return Comments.find({talk: talk});
  }
});
