/* eslint-disable prefer-arrow-callback */
import {Meteor} from 'meteor/meteor';
import {Images} from '../images.js';

Images.allowClient();

Meteor.publish('images', function(session) {
  check(session, String);
  if (!session) {
    return this.ready();
  } else {
    return Images.find({'meta.sessionId': session}).cursor;
  }
});
