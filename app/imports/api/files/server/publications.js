/* eslint-disable prefer-arrow-callback */
import {Meteor} from 'meteor/meteor';
import {Files} from '../files.js';

Files.allowClient();

Meteor.publish('files', function() {
  return Files.find().cursor;
});

// todo update per session
// Meteor.publish('comments', session => Comments.find({session: session}));
