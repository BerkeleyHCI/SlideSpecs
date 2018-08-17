import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {DDPRateLimiter} from 'meteor/ddp-rate-limiter';
import _ from 'lodash';

import {Comments} from './comments.js';

SlideSchema = new SimpleSchema({
  slideNo: {type: String},
  slideId: {type: String},
});

export const createComment = new ValidatedMethod({
  name: 'comments.create',
  validate: new SimpleSchema({
    session: {type: String},
    author: {type: String},
    content: {type: String, min: 1},
    slides: {type: [SlideSchema]},
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
  name: 'comments.update',
  validate: new SimpleSchema({
    author: {type: String},
    commentId: {type: String},
    newContent: {type: String, min: 1},
  }).validator(),
  run({author, commentId, newContent}) {
    const comment = Comments.findOne(commentId);
    if (comment.author == author) {
      Comments.update(commentId, {$set: {content: newContent}});
    }
  },
});

export const deleteComment = new ValidatedMethod({
  name: 'comments.delete',
  validate: new SimpleSchema({
    author: {type: String},
    commentId: {type: String},
  }).validator(),
  run({author, commentId}) {
    if (comment.author == author) {
      Comments.remove(commentId);
    }
  },
});
