import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import _ from 'lodash';

import {Sessions} from './sessions.js';

export const createSession = new ValidatedMethod({
  name: 'sessions.create',
  validate: new SimpleSchema({}).validator(),
  run({}) {
    if (!this.userId) {
      throw new Meteor.Error(
        'api.sessions.create.accessDenied',
        'You must log in to create a session.',
      );
    } else {
      return Sessions.insert({
        userId: this.userId,
        created: Date.now(),
      });
    }
  },
});

export const renameSession = new ValidatedMethod({
  name: 'sessions.rename',
  validate: new SimpleSchema({
    sessionId: {type: String},
    newName: {type: String},
  }).validator(),
  run({sessionId, newName}) {
    const session = Sessions.findOne(sessionId);
    if (session.userId !== this.userId) {
      throw new Meteor.Error(
        'api.sessions.rename.accessDenied',
        "You don't have permission to edit this session.",
      );
    } else {
      Sessions.update(sessionId, {$set: {name: newName}});
    }
  },
});

export const deleteSession = new ValidatedMethod({
  name: 'sessions.delete',
  validate: new SimpleSchema({
    sessionId: {type: String},
  }).validator(),
  run({sessionId}) {
    const session = Sessions.findOne(sessionId);
    if (session.userId !== this.userId) {
      throw new Meteor.Error(
        'api.sessions.delete.accessDenied',
        "You don't have permission to edit this session.",
      );
    } else {
      try {
        // deleting related files
        Files.remove({'meta.sessionId': sessionId});
        Comments.remove({session: sessionId});
        Sessions.remove(sessionId);
      } catch (e) {
        console.error(e);
      }
    }
  },
});
