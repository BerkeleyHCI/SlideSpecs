import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {Random} from 'meteor/random';

import {Talks} from './talks.js';
import {Comments} from '../comments/comments.js';
import {Files} from '../files/files.js';
import {Images} from '../images/images.js';
import _ from 'lodash';

export const createTalk = new ValidatedMethod({
  name: 'talks.create',
  validate: new SimpleSchema({}).validator(),
  run({name}) {
    if (!this.userId) {
      throw new Meteor.Error(
        'api.sessions.create.accessDenied',
        'You must log in to create a session.',
      );
    }

    if (!name) {
      const iter = new Date().toLocaleDateString();
      name = `talk ${iter}`;
    }

    return Talks.insert({
      userId: this.userId,
      created: Date.now(),
      secret: Random.id(),
      name,
    });
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
    if (!talk) {
      throw new Meteor.Error(
        'api.talks.delete.talkNotFound',
        'This talk does not exist.',
      );
    }

    // Talk owner should be able to edit/delete talk
    if (talk.userId === this.userId) {
      return Talks.update(talkId, {$set: {name: newName}});
    } else {
      throw new Meteor.Error(
        'api.talks.rename.accessDenied',
        "You don't have permission to edit this talk.",
      );
      return false;
    }
  },
});

// For uploading status.
export const setTalkProgress = new ValidatedMethod({
  name: 'talks.setProgress',
  validate: new SimpleSchema({
    talkId: {type: String},
    progress: {type: Number},
  }).validator(),
  run({talkId, progress}) {
    const talk = Talks.findOne(talkId);
    if (!talk) {
      throw new Meteor.Error(
        'api.talks.delete.talkNotFound',
        'This talk does not exist.',
      );
    }

    // Talk owner should be able to edit/delete talk
    if (talk.userId === this.userId) {
      return Talks.update(talkId, {$set: {progress: progress}});
    } else {
      throw new Meteor.Error(
        'api.talks.rename.accessDenied',
        "You don't have permission to edit this talk.",
      );
    }
  },
});

export const setRespondingComment = new ValidatedMethod({
  name: 'talks.setRespondingComment',
  validate: new SimpleSchema({
    talkId: {type: String},
    commentId: {type: String},
  }).validator(),
  run({talkId, commentId}) {
    const talk = Talks.findOne(talkId);
    if (talk) {
      Talks.update(talkId, {$set: {active: commentId}});
    } else {
      throw new Meteor.Error('api.sessions', 'Talk does not exist.');
    }
  },
});

export const checkUserTalk = new ValidatedMethod({
  name: 'talk.checkUser',
  validate: new SimpleSchema({
    matchId: {type: String},
  }).validator(),
  run({matchId}) {
    const talk = Talks.findOne(matchId);
    if (!talk) {
      return false; // talk does not exist
    } else if (talk.userId === this.userId) {
      return true; // user owns talk
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
    }

    // Talk owner or session owner should be able to edit/delete talk
    if (talk.userId === this.userId) {
      try {
        // deleting related files
        Files.remove({'meta.talkId': talkId});
        Images.remove({'meta.talkId': talkId});
        Comments.remove({talk: talkId});
        return Talks.remove(talkId);
      } catch (e) {
        console.error(e);
      }
    } else {
      throw new Meteor.Error(
        'api.talks.delete.accessDenied',
        "You don't have permission to delete this talk.",
      );
    }
  },
});
