import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {DDPRateLimiter} from 'meteor/ddp-rate-limiter';
import {_} from 'meteor/underscore';

import {Sessions} from './sessions.js';

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

// Get session of all method names on Sessions
const LISTS_METHODS = _.pluck([updateName], 'name');

// Only allow 5 session operations per connection per second

if (Meteor.isServer) {
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
