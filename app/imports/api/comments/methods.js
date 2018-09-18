import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {DDPRateLimiter} from 'meteor/ddp-rate-limiter';
import _ from 'lodash';

import {Sessions} from '../sessions/sessions.js';
import {Comments} from './comments.js';

SlideSchema = new SimpleSchema({
  slideNo: {type: String},
  slideId: {type: String},
});

export const createComment = new ValidatedMethod({
  name: 'comments.create',
  validate: new SimpleSchema({
    session: {type: String},
    author: {type: String, min: 1},
    content: {type: String, min: 1},
    slides: {type: [SlideSchema]},
    agree: {type: [String], optional: true},
    discuss: {type: [String], optional: true},
    addressed: {type: Boolean, optional: true},
    userOwn: {type: Boolean, optional: true},
  }).validator(),
  run({author, userOwn, content, session, addressed, discuss, agree, slides}) {
    const sess = Sessions.findOne(session);
    if (sess) {
      const data = {
        created: Date.now(),
        userOwn,
        author,
        discuss,
        addressed,
        agree,
        content,
        session,
        slides,
      };
      console.log({type: 'comment.create', ...data});
      return Comments.insert(data);
    }
  },
});

export const addressComment = new ValidatedMethod({
  name: 'comments.address',
  validate: new SimpleSchema({
    commentId: {type: String},
  }).validator(),
  run({commentId}) {
    const comment = Comments.findOne(commentId);
    if (!comment) {
      return false;
    } else {
      const newAddress = !comment.addressed;
      return Comments.update(commentId, {$set: {addressed: newAddress}});
    }
  },
});

export const agreeComment = new ValidatedMethod({
  name: 'comments.agree',
  validate: new SimpleSchema({
    commentId: {type: String},
    author: {type: String},
  }).validator(),
  run({author, commentId}) {
    author = author.trim();
    const comment = Comments.findOne(commentId);
    if (!comment) {
      return false;
    }

    let data;
    if (!comment.agree) {
      data = [];
    } else {
      data = comment.agree;
    }

    let newAgree;
    const agreeIdx = data.indexOf(author);
    if (agreeIdx >= 0) {
      data.splice(agreeIdx, 1);
      newAgree = data;
    } else {
      newAgree = data.concat([author]);
    }

    Comments.update(commentId, {$set: {agree: newAgree}});
  },
});

export const discussComment = new ValidatedMethod({
  name: 'comments.discuss',
  validate: new SimpleSchema({
    commentId: {type: String},
    author: {type: String},
  }).validator(),
  run({author, commentId}) {
    author = author.trim();
    const comment = Comments.findOne(commentId);
    if (!comment) {
      return false;
    }

    if (!comment.discuss) {
      comment.discuss = [];
    }

    let newDiscuss;
    const discussIdx = comment.discuss.indexOf(author);
    if (discussIdx >= 0) {
      comment.discuss.splice(discussIdx, 1);
      newDiscuss = comment.discuss;
    } else {
      newDiscuss = comment.discuss.concat([author]);
    }

    Comments.update(commentId, {$set: {discuss: newDiscuss}});
  },
});

export const updateComment = new ValidatedMethod({
  name: 'comments.update',
  validate: new SimpleSchema({
    author: {type: String},
    commentId: {type: String},
    newContent: {type: String, min: 1},
  }).validator(),
  run({author, commentId, newContent}) {
    const comment = Comments.findOne(commentId);
    if (comment && comment.author == author) {
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
    const comment = Comments.findOne(commentId);
    if (comment && comment.author == author) {
      console.log({type: 'comment.delete', ...comment});
      Comments.remove(commentId);
    }
  },
});
