import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';

import {Events} from './events.js';

export const logEvent = new ValidatedMethod({
  name: 'events.create',
  validate: new SimpleSchema({
    data: {type: String},
  }).validator(),
  run({data}) {
    const log = {created: Date.now(), data};
    console.log({type: 'event', ...log});
    return Events.insert(log);
  },
});

export const logBlob = blob => {
  const data = JSON.stringify(blob);
  const log = {created: Date.now(), data};
  return Events.insert(log);
};

export const deleteEvent = new ValidatedMethod({
  name: 'events.delete',
  validate: new SimpleSchema({
    eventId: {type: String},
  }).validator(),
  run({eventId}) {
    Events.remove(eventId);
  },
});
