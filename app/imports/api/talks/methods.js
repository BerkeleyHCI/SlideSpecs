import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {Random} from 'meteor/random';

;
import {Talks} from './talks.js';
import {Comments} from '../comments/comments.js';
import {Files} from '../files/files.js';
import {Images} from '../images/images.js';
import _ from 'lodash';

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
      return false;
    }

    const talkId = Talks.insert({
      name: name.replace(/\.[^/.]+$/, ''),
      userId: this.userId,
      created: Date.now(),
      secret: Random.id(),
      session: sessionId,
      progress: 0,
    });

    const session = Sessions.findOne(sessionId);
    if (!session) {
      throw new Meteor.Error(
        'api.talks.addTalk.sessionNotFound',
        'This session for the talk does not exist.',
      );
    } else {
      const newTalks = [...session.talks, talkId];
      Sessions.update(sessionId, {$set: {talks: newTalks}});
    }

    return talkId;
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

    // Talk owner or session owner should be able to edit/delete talk
    const sess = Sessions.findOne(talk.session);
    if (talk.userId === this.userId || sess.userId === this.userId) {
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

    // Talk owner or session owner should be able to edit/delete talk
    const sess = Sessions.findOne(talk.session);
    if (talk.userId === this.userId || sess.userId === this.userId) {
      return Talks.update(talkId, {$set: {progress: progress}});
    } else {
      throw new Meteor.Error(
        'api.talks.rename.accessDenied',
        "You don't have permission to edit this talk.",
      );
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

    // check if user owns session in talk
    const sess = Sessions.findOne(talk.session);
    if (sess && sess.userId === this.userId) {
      return true; // not talk owner but session owner
    } else {
      return false; // refuse to let see talk.
    }
  },
});

export const moveSessionTalk = new ValidatedMethod({
  name: 'talk.moveSessionTalk',
  validate: new SimpleSchema({
    talkId: {type: String},
    position: {type: Number},
  }).validator(),
  run({talkId, position}) {
    const talk = Talks.findOne(talkId);
    if (!talk) {
      throw new Meteor.Error('api.talks.noTalk', 'There is no talk.');
    }

    const sess = Sessions.findOne(talk.session);
    if (!sess || sess.userId !== this.userId) {
      throw new Meteor.Error(
        'api.talks.addTalk.sessionNotEditable',
        'You cannot edit this session.',
      );
    }

    // move element from one array position to another
    const oldIdx = sess.talks.findIndex(t => t == talk._id);
    const oTalks = sess.talks.filter(t => t != talk._id);
    const before = oTalks.slice(0, position);
    const after = oTalks.slice(position);
    const newTalks = [...before, talk._id, ...after];

    Sessions.update(talk.session, {$set: {talks: newTalks}});
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
    const sess = Sessions.findOne(talk.session);
    if (talk.userId === this.userId || sess.userId === this.userId) {
      try {
        // Remove id from the session object
        const newTalks = _.remove(sess.talks, t => t == talk._id);
        Sessions.update(talk.session, {$set: {talks: newTalks}});

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
