/* eslint-disable prefer-arrow-callback */

import {Meteor} from 'meteor/meteor';

import {Files} from '../lists.js';

Meteor.publish('lists.public', function listsPublic() {
  return Files.find(
    {
      userId: {$exists: false},
    },
    {
      fields: Files.publicFields,
    },
  );
});

Meteor.publish('lists.private', function listsPrivate() {
  if (!this.userId) {
    return this.ready();
  }

  return Files.find(
    {
      userId: this.userId,
    },
    {
      fields: Files.publicFields,
    },
  );
});
