import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {Random} from 'meteor/random';

import {Sessions} from './sessions.js';
import {Talks} from '../talks/talks.js';
import {Comments} from '../comments/comments.js';
import {Files} from '../files/files.js';
import {Images} from '../images/images.js';

/*
- #story
- #delivery
- #slideDesign
- #great
- #confusing
- #coreIdea
 * */

export const createSession = new ValidatedMethod({
  name: 'sessions.create',
  validate: new SimpleSchema({}).validator(),
  run({name}) {
    if (!this.userId) {
      throw new Meteor.Error(
        'api.sessions.create.accessDenied',
        'You must log in to create a session.',
      );
    }

    if (!name) {
      const basename = 'session ';
      let iter = new Date().toLocaleDateString();
      name = `${basename} ${iter}`;
    }

    return Sessions.insert({
      userId: this.userId,
      created: Date.now(),
      secret: Random.id(),
      talks: [],
      name,
    });
  },
});

export const checkUserSession = new ValidatedMethod({
  name: 'session.checkUser',
  validate: new SimpleSchema({
    matchId: {type: String},
  }).validator(),
  run({matchId}) {
    //console.log(matchId, sess, this.userId);
    const sess = Sessions.findOne(matchId);
    if (sess && sess.userId === this.userId) {
      return true; // user owns session
    } else {
      return false; // refuse access
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
    if (!session || session.userId !== this.userId) {
      throw new Meteor.Error(
        'api.sessions.delete.accessDenied',
        "You don't have permission to delete this session.",
      );
    } else {
      try {
        // deleting related files / records
        Files.remove({'meta.sessionId': sessionId});
        Images.remove({'meta.sessionId': sessionId});
        Comments.remove({session: sessionId});
        Talks.remove({session: sessionId});
        Sessions.remove(sessionId);
      } catch (e) {
        console.error(e);
      }
    }
  },
});
