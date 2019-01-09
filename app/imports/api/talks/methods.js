import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';

import {Talks} from './talks.js';
import {Comments} from '../comments/comments.js';
import {Files} from '../files/files.js';
import {Images} from '../images/images.js';

// common pattern for checking permission
//const talkCheck = talkId => { }

export const createTalk = new ValidatedMethod({
  name: 'talks.create',
  validate: new SimpleSchema({
    sessionId: {type: String},
    name: {type: String},
  }).validator(),
  run({sessionId, name}) {
    if (!this.userId) {
      throw new Meteor.Error(
        'api.talks.create.accessDenied',
        'You must log in to create a talk.',
      );
    } else {
      return Talks.insert({
        name: name,
        userId: this.userId,
        created: Date.now(),
        session: sessionId,
      });
    }
  },
});

export const renameTalk = new ValidatedMethod({
  name: 'talks.rename',
  validate: new SimpleSchema({
    talkId: {type: String},
    newName: {type: String},
  }).validator(),
  run({talkId, newName}) {
    const talk = Talks.findOne(talkId);
    if (talk.userId !== this.userId) {
      throw new Meteor.Error(
        'api.talks.rename.accessDenied',
        "You don't have permission to edit this talk.",
      );
    } else {
      Talks.update(talkId, {$set: {name: newName}});
    }
  },
});

export const deleteTalk = new ValidatedMethod({
  name: 'talks.delete',
  validate: new SimpleSchema({
    talkId: {type: String},
  }).validator(),
  run({talkId}) {
    const talk = Talks.findOne(talkId);
    if (!talk) {
      throw new Meteor.Error(
        'api.talks.delete.talkNotFound',
        'This talk does not exist.',
      );
    } else if (talk.userId !== this.userId) {
      throw new Meteor.Error(
        'api.talks.delete.accessDenied',
        "You don't have permission to delete this talk.",
      );
    } else {
      try {
        // deleting related files
        Files.remove({'meta.talkId': talkId});
        Images.remove({'meta.talkId': talkId});
        Comments.remove({talk: talkId});
        Talks.remove(talkId);
      } catch (e) {
        console.error(e);
      }
    }
  },
});
