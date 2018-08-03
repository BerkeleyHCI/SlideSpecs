/* eslint-disable prefer-arrow-callback */
import {Meteor} from 'meteor/meteor';
import {Sessions} from '../sessions.js';

Sessions.allowClient();

Meteor.publish('sessions.all', function() {
  return Sessions.find().cursor;
});
