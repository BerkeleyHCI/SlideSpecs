/* eslint-disable prefer-arrow-callback */
import {Meteor} from 'meteor/meteor';
import {Files} from '../files.js';

Files.allowClient(); // TODO - check if this is still needed, or if there is a safer way to upload.

Meteor.publish('files', function(session) {
  check(session, String);
  if (!session) {
    return this.ready();
  } else {
    return Files.find({'meta.sessionId': session}).cursor;
  }
});
