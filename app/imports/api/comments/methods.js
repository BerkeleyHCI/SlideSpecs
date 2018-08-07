import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {DDPRateLimiter} from 'meteor/ddp-rate-limiter';
import {_} from 'meteor/underscore';

import {Comments} from './comments.js';

export const createComment = new ValidatedMethod({
  name: 'comments.create',
  validate: new SimpleSchema({}).validator(),
  run({}) {
    if (!this.userId) {
      throw new Meteor.Error(
        'api.comments.create.accessDenied',
        'You must log in to create a comment.',
      );
    } else {
      return Comments.insert({
        userId: this.userId,
        created: Date.now(),
      });
    }
  },
});

export const renameComment = new ValidatedMethod({
  name: 'comments.rename',
  validate: new SimpleSchema({
    commentId: {type: String},
    newName: {type: String},
  }).validator(),
  run({commentId, newName}) {
    const comment = Comments.findOne(commentId);
    if (comment.userId !== this.userId) {
      throw new Meteor.Error(
        'api.comments.rename.accessDenied',
        "You don't have permission to edit this comment.",
      );
    } else {
      Comments.update(commentId, {$set: {name: newName}});
    }
  },
});

export const deleteComment = new ValidatedMethod({
  name: 'comments.delete',
  validate: new SimpleSchema({
    commentId: {type: String},
  }).validator(),
  run({commentId}) {
    const comment = Comments.findOne(commentId);
    if (comment.userId !== this.userId) {
      throw new Meteor.Error(
        'api.comments.delete.accessDenied',
        "You don't have permission to edit this comment.",
      );
    } else {
      Comments.remove(commentId);
    }
  },
});
