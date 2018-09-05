import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import _ from 'lodash';
import {Events} from './events.js';

export const createEvent = new ValidatedMethod({
  name: 'events.create',
  validate: new SimpleSchema({
    session: {type: String},
    slideNo: {type: String},
  }).validator(),
  run({session, slideNo}) {
    const session_obj = Session.find(session);
    const slide_objs = Files.find({'meta.sessionId': session});
    if (session_obj && slide_objs.length > slideNo)
      return Events.insert({
        created: Date.now(),
        session,
        slideNo,
      });
  },
});

export const deleteEvent = new ValidatedMethod({
  name: 'events.delete',
  validate: new SimpleSchema({
    eventId: {type: String},
  }).validator(),
  run({author, eventId}) {
    const e = Events.findOne(eventId);
    if (e) {
      Events.remove(eventId);
    }
  },
});
