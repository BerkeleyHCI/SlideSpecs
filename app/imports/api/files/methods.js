import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';

import {Files} from './files.js';

// TODO - include file creation method
// TODO - restrict these operations to file owner

export const renameFile = new ValidatedMethod({
  name: 'files.rename',
  validate: new SimpleSchema({
    fileId: {type: String},
    newName: {type: String},
  }).validator(),
  run({fileId, newName}) {
    this.unblock(); // <-- Use to make this method asynchronous
    const good = Files.collection.update(fileId, {$set: {name: newName}});
    return good;
  },
});

export const deleteFile = new ValidatedMethod({
  name: 'files.delete',
  validate: new SimpleSchema({
    fileId: {type: String},
  }).validator(),
  run({fileId}) {
    return Files.remove(fileId);
  },
});

export const deleteSessionFiles = new ValidatedMethod({
  name: 'files.deleteSessionFiles',
  validate: new SimpleSchema({
    sessionId: {type: String},
  }).validator(),
  run({sessionId}) {
    return Files.remove({'meta.sessionId': sessionId});
  },
});
