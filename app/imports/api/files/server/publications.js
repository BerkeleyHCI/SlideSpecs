/* eslint-disable prefer-arrow-callback */
import {Meteor} from 'meteor/meteor';
import {Files} from '../files.js';

Meteor.publish('files.public', function filesPublic() {
  return Files.find(
    {
      userId: {$exists: false},
    },
    {
      fields: Files.publicFields,
    },
  );
});

Meteor.publish('files.private', function filesPrivate() {
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
