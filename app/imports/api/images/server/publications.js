/* eslint-disable prefer-arrow-callback */
import {Meteor} from 'meteor/meteor';
import {Images} from '../files.js';

Images.allowClient();

// Check comments for filtering per session.

Meteor.publish('images', function() {
  return Images.find().cursor;
});
