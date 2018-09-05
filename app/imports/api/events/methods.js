import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {DDPRateLimiter} from 'meteor/ddp-rate-limiter';
import _ from 'lodash';

import {Events} from './events.js';

SlideSchema = new SimpleSchema({
  slideNo: {type: String},
  slideId: {type: String},
});

export const createEvent = new ValidatedMethod({
  name: 'events.create',
  validate: new SimpleSchema({
    session: {type: String},
    author: {type: String},
    content: {type: String, min: 1},
    slides: {type: [SlideSchema]},
  }).validator(),
  run({author, content, session, slides}) {
    // TODO check that the session the slides exists
    return Events.insert({
      created: Date.now(),
      author,
      content,
      session,
      slides,
    });
  },
});

export const agreeEvent = new ValidatedMethod({
  name: 'events.agree',
  validate: new SimpleSchema({
    eventId: {type: String},
    author: {type: String},
  }).validator(),
  run({author, eventId}) {
    author = author.trim();
    const event = Events.findOne(eventId);
    if (!event) {
      return false;
    }

    let data;
    if (!event.agree) {
      data = [];
    } else {
      data = event.agree;
    }

    let newAgree;
    const agreeIdx = data.indexOf(author);
    if (agreeIdx >= 0) {
      data.splice(agreeIdx, 1);
      newAgree = data;
    } else {
      newAgree = data.concat([author]);
    }

    Events.update(eventId, {$set: {agree: newAgree}});
  },
});

export const discussEvent = new ValidatedMethod({
  name: 'events.discuss',
  validate: new SimpleSchema({
    eventId: {type: String},
    author: {type: String},
  }).validator(),
  run({author, eventId}) {
    author = author.trim();
    const event = Events.findOne(eventId);
    if (!event) {
      return false;
    }

    if (!event.discuss) {
      event.discuss = [];
    }

    let newDiscuss;
    const discussIdx = event.discuss.indexOf(author);
    if (discussIdx >= 0) {
      event.discuss.splice(discussIdx, 1);
      newDiscuss = event.discuss;
    } else {
      newDiscuss = event.discuss.concat([author]);
    }

    Events.update(eventId, {$set: {discuss: newDiscuss}});
  },
});

export const updateEvent = new ValidatedMethod({
  name: 'events.update',
  validate: new SimpleSchema({
    author: {type: String},
    eventId: {type: String},
    newContent: {type: String, min: 1},
  }).validator(),
  run({author, eventId, newContent}) {
    const event = Events.findOne(eventId);
    if (event && event.author == author) {
      Events.update(eventId, {$set: {content: newContent}});
    }
  },
});

export const deleteEvent = new ValidatedMethod({
  name: 'events.delete',
  validate: new SimpleSchema({
    author: {type: String},
    eventId: {type: String},
  }).validator(),
  run({author, eventId}) {
    const event = Events.findOne(eventId);
    if (event && event.author == author) {
      Events.remove(eventId);
    }
  },
});
