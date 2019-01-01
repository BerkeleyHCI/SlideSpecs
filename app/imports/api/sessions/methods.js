import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';

import {Sessions} from './sessions.js';
import {Comments} from '../comments/comments.js';
import {Events} from '../events/events.js';
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
  run({}) {
    if (!this.userId) {
      throw new Meteor.Error(
        'api.sessions.create.accessDenied',
        'You must log in to create a session.',
      );
    } else {
      const starterComment = (err, _id) => {
        if (!err) {
          Comments.insert({
            created: Date.now(),
            session: _id,
            slides: [],
            author: 'system',
            content: `Starter tags: #delivery #slideDesign #story #great #confusing #coreIdea`,
          });
        }
      };

      return Sessions.insert(
        {
          userId: this.userId,
          created: Date.now(),
        },
        starterComment,
      );
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

export const setRespondingComment = new ValidatedMethod({
  name: 'sessions.setRespondingComment',
  validate: new SimpleSchema({
    sessionId: {type: String},
    commentId: {type: String},
  }).validator(),
  run({sessionId, commentId}) {
    const session = Sessions.findOne(sessionId);
    if (session) {
      Sessions.update(sessionId, {$set: {responding: commentId}});
    } else {
      throw new Meteor.Error('api.sessions', 'Session does not exist.');
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
        Images.remove({'meta.sessionId': sessionId});
        Comments.remove({session: sessionId});
        Events.remove({session: sessionId});
        Sessions.remove(sessionId);
      } catch (e) {
        console.error(e);
      }
    }
  },
});
