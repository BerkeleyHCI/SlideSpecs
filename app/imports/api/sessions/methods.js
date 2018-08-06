import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {DDPRateLimiter} from 'meteor/ddp-rate-limiter';
import {_} from 'meteor/underscore';

import {Sessions} from './sessions.js';

export const createSession = new ValidatedMethod({
  name: 'sessions.create',
  validate: new SimpleSchema({
    userId: {type: String},
  }).validator(),
  run({userId}) {
    if (!userId || !userId === this.userId) {
      throw new Meteor.Error(
        'api.sessions.create.accessDenied',
        'You must log in to create a session.',
      );
    } else {
      Sessions.insert({
        userId,
        created: Date.now(),
      });
    }
  },
});

export const updateSessionName = new ValidatedMethod({
  name: 'sessions.updateName',
  validate: new SimpleSchema({
    sessionId: {type: String},
    newName: {type: String},
  }).validator(),
  run({sessionId, newName}) {
    const session = Sessions.findOne(sessionId);
    if (!session.userId !== this.userId) {
      throw new Meteor.Error(
        'api.sessions.updateName.accessDenied',
        "You don't have permission to edit this session.",
      );
    } else {
      Sessions.update(sessionId, {$set: {name: newName}});
    }
  },
});
