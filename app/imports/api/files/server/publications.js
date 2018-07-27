/* eslint-disable prefer-arrow-callback */
import {Meteor} from 'meteor/meteor';
import {Files} from '../files.js';

Files.allowClient();

Meteor.publish('files.all', function() {
  return Files.find().cursor;
});
