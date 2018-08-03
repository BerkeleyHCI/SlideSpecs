import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {DDPRateLimiter} from 'meteor/ddp-rate-limiter';
import {_} from 'meteor/underscore';

import {Sessions} from './sessions.js';

export const insert = new ValidatedMethod({
  name: 'insert',
  validate: new SimpleSchema({}).validator(),
  run({}) {
    return Sessions.insert({}, null);
  },
});

export const makePrivate = new ValidatedMethod({
  name: 'make private',
  validate: LIST_ID_ONLY,
  run({sessionId}) {
    if (!this.userId) {
      throw new Meteor.Error(
        'api.sessions.makePrivate.notLoggedIn',
        'Must be logged in to make private sessions.',
      );
    }

    const session = Sessions.findOne(sessionId);

    if (session.isLastPublicList()) {
      throw new Meteor.Error(
        'api.sessions.makePrivate.lastPublicList',
        'Cannot make the last public session private.',
      );
    }

    Sessions.update(sessionId, {
      $set: {userId: this.userId},
    });
  },
});

export const makePublic = new ValidatedMethod({
  name: 'make public',
  validate: LIST_ID_ONLY,
  run({sessionId}) {
    if (!this.userId) {
      throw new Meteor.Error(
        'api.sessions.makePublic.notLoggedIn',
        'Must be logged in.',
      );
    }

    const session = Sessions.findOne(sessionId);

    if (!session.editableBy(this.userId)) {
      throw new Meteor.Error(
        'api.sessions.makePublic.accessDenied',
        "You don't have permission to edit this session.",
      );
    }

    Sessions.update(sessionId, {
      $unset: {userId: true},
    });
  },
});

export const updateName = new ValidatedMethod({
  name: 'update name',
  validate: new SimpleSchema({
    sessionId: {type: String},
    newName: {type: String},
  }).validator(),
  run({sessionId, newName}) {
    const session = Sessions.findOne(sessionId);

    if (!session.editableBy(this.userId)) {
      throw new Meteor.Error(
        'api.sessions.updateName.accessDenied',
        "You don't have permission to edit this session.",
      );
    }

    Sessions.update(sessionId, {
      $set: {name: newName},
    });
  },
});

export const remove = new ValidatedMethod({
  name: 'remove',
  validate: LIST_ID_ONLY,
  run({sessionId}) {
    const session = Sessions.findOne(sessionId);

    if (!session.editableBy(this.userId)) {
      throw new Meteor.Error(
        'access denied',
        "You don't have permission to remove this session.",
      );
    }

    if (session.isLastPublicList()) {
      throw new Meteor.Error(
        'remove last public session',
        'Cannot delete the last public session.',
      );
    }

    Sessions.remove(sessionId);
  },
});

// Get session of all method names on Sessions
const LISTS_METHODS = _.pluck(
  [insert, makePublic, makePrivate, updateName, remove],
  'name',
);

if (Meteor.isServer) {
  // Only allow 5 session operations per connection per second
  DDPRateLimiter.addRule(
    {
      name(name) {
        return _.contains(LISTS_METHODS, name);
      },

      // Rate limit per connection ID
      connectionId() {
        return true;
      },
    },
    5,
    1000,
  );
}
