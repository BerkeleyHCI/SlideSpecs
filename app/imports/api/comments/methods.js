import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {Sessions} from '../sessions/sessions.js';
import {Talks} from '../talks/talks.js';
import {Comments} from './comments.js';

const SlideSchema = new SimpleSchema({
  slideNo: {type: String},
  slideId: {type: String},
});

export const createComment = new ValidatedMethod({
  name: 'comments.create',
  validate: new SimpleSchema({
    session: {type: SimpleSchema.RegEx.Id},
    talk: {type: SimpleSchema.RegEx.Id},
    author: {type: String, min: 1},
    content: {type: String, min: 1},
    slides: {type: [SlideSchema]},
    agree: {type: [String], optional: true},
    discuss: {type: [String], optional: true},
    userOwn: {type: Boolean, optional: true},
  }).validator(),
  run({session, talk, author, content, slides, agree, discuss, userOwn}) {
    const sess = Sessions.findOne(session);
    const uTalk = Talks.findOne(talk);
    if (sess && uTalk && uTalk.session === sess._id) {
      const data = {
        created: Date.now(),
        session,
        talk,
        author,
        content,
        slides,
        agree,
        discuss,
        userOwn,
      };
      //console.log({type: 'comment.create', ...data});
      return Comments.insert(data);
    } else {
      console.error('Session and Talk data does not match.', sess, uTalk);
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
    if (comment) {
      const newAddress = !comment.addressed;
      return Comments.update(commentId, {$set: {addressed: newAddress}});
    }
  },
});

// Ugh... this is naming for addressing a comment in the review pane.
// Probably should name these similarly to their associated pages.

export const completeComment = new ValidatedMethod({
  name: 'comments.complete',
  validate: new SimpleSchema({
    commentId: {type: String},
  }).validator(),
  run({commentId}) {
    const comment = Comments.findOne(commentId);
    if (!comment) {
      return false;
    } else {
      const newComplete = !comment.completed;
      return Comments.update(commentId, {$set: {completed: newComplete}});
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
      const newOwn = comment.userOwn || newContent.includes('#private');
      Comments.update(commentId, {
        $set: {content: newContent, userOwn: newOwn},
      });
    }
  },
});

export const toggleVisibility = new ValidatedMethod({
  name: 'comments.toggleVisibility',
  validate: new SimpleSchema({
    author: {type: String},
    commentId: {type: String},
  }).validator(),
  run({author, commentId}) {
    const comment = Comments.findOne(commentId);
    if (comment && comment.author == author) {
      Comments.update(commentId, {
        $set: {userOwn: !comment.userOwn},
      });
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
