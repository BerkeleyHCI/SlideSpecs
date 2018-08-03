/* eslint-disable prefer-arrow-callback */

import {Meteor} from 'meteor/meteor';
import {Sessions} from '../sessions.js';

Meteor.publish('sessions', function sessionsPrivate() {
  if (!this.userId) {
    return this.ready();
  }

  return Sessions.find(
    {
      userId: this.userId,
    },
    {
      fields: Sessions.publicFields,
    },
  );
});
