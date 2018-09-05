import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import _ from 'lodash';

import {Sessions} from '../sessions/sessions.js';
import {Files} from '../files/files.js';
import {Events} from './events.js';

export const createEvent = new ValidatedMethod({
  name: 'events.create',
  validate: new SimpleSchema({
    session: {type: String},
    slideNo: {type: Number},
  }).validator(),
  run({session, slideNo}) {
    const totalSlides = Files.find({'meta.sessionId': session});
    const realSess = Sessions.findOne(session);

    if (!realSess) {
      throw new Error('This session pair is not valid.');
    }

    if (totalSlides.length <= slideNo) {
      throw new Error('This session number is not valid.');
    }

    return Events.insert({
      created: Date.now(),
      session,
      slideNo,
    });
  },
});

// ATM this is not used.
export const deleteEvent = new ValidatedMethod({
  name: 'events.delete',
  validate: new SimpleSchema({
    eventId: {type: String},
  }).validator(),
  run({eventId}) {
    const e = Events.findOne(eventId);
    if (e) {
      Events.remove(eventId);
    }
  },
});
