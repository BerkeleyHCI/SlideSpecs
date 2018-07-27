import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {Files} from './files.js';

export const remove = new ValidatedMethod({
  name: 'files.remove',
  validate: new SimpleSchema({
    fileId: {type: String},
  }).validator(),
  run({fileId}) {
    const file = Files.findOne(fileId);
    Files.remove(fileId);
  },
});

export const rename = new ValidatedMethod({
  name: 'files.rename',
  validate: new SimpleSchema({
    fileId: {type: String},
    newName: {type: String},
  }).validator(),
  run({fileId, newName}) {
    const file = Files.findOne(fileId);
    Files.update(fileId, {$set: {fileName: newName}});
  },
});
