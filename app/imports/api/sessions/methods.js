import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {Sessions} from './sessions.js';

export const remove = new ValidatedMethod({
  name: 'sessions.remove',
  validate: new SimpleSchema({
    fileId: {type: String},
  }).validator(),
  run({fileId}) {
    const file = Sessions.findOne(fileId);
    Sessions.remove(fileId);
  },
});

export const rename = new ValidatedMethod({
  name: 'sessions.rename',
  validate: new SimpleSchema({
    fileId: {type: String},
    newName: {type: String},
  }).validator(),
  run({fileId, newName}) {
    const file = Sessions.findOne(fileId);
    Sessions.update(fileId, {$set: {fileName: newName}});
  },
});
