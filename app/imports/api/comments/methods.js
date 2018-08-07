import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {DDPRateLimiter} from 'meteor/ddp-rate-limiter';
import {_} from 'meteor/underscore';

import {Comments} from './comments.js';

export const createComment = new ValidatedMethod({
  name: 'comments.create',
  validate: new SimpleSchema({
    session: {type: String},
    author: {type: String},
    content: {type: String},
    slides: {type: [Object]},
  }).validator(),
  run({author, content, session, slides}) {
    return Comments.insert({
      created: Date.now(),
      author,
      content,
      session,
      slides,
    });
  },
});

export const renameComment = new ValidatedMethod({
  name: 'comments.rename',
  validate: new SimpleSchema({
    commentId: {type: String},
    newName: {type: String},
  }).validator(),
  run({commentId, newName}) {
    // TODO - have SOME type of auth in here... yikes
    Comments.update(commentId, {$set: {content: newName}});
  },
});

export const deleteComment = new ValidatedMethod({
  name: 'comments.delete',
  validate: new SimpleSchema({
    commentId: {type: String},
  }).validator(),
  run({commentId}) {
    // TODO - have SOME type of auth in here... yikes
    Comments.remove(commentId);
  },
});
