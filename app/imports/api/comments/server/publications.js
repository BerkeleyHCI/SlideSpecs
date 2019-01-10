import {Meteor} from 'meteor/meteor';
import {Comments} from '../comments.js';

Meteor.publish('comments.user', x => {
  check(x, String);
  return Comments.find({userId: x}).cursor;
});

Meteor.publish('comments', talk => {
  check(talk, String);
  return Comments.find({talk: talk});
});
