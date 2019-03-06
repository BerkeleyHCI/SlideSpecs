/* eslint-disable prefer-arrow-callback */
import {Meteor} from 'meteor/meteor';
import {Sounds} from '../sounds.js';

Sounds.allowClient();

Meteor.publish('sounds.user', x => {
  check(x, String);
  return Sounds.find({'meta.userId': x}).cursor;
});

Meteor.publish('sounds.session', function(session) {
  check(session, String);
  if (!session) {
    return this.ready();
  } else {
    return Sounds.find({'meta.sessionId': session}).cursor;
  }
});

Meteor.publish('sounds.talk', function(talk) {
  check(talk, String);
  if (!talk) {
    return this.ready();
  } else {
    return Sounds.find({'meta.talkId': talk}).cursor;
  }
});
