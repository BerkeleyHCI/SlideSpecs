import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';

import {Files} from './files.js';

// TODO - include file creation method

export const renameFile = new ValidatedMethod({
  name: 'files.rename',
  validate: new SimpleSchema({
    fileId: {type: String},
    newName: {type: String},
  }).validator(),
  run({fileId, newName}) {
    console.log(fileId, newName);
    return Files.update(fileId, {$set: {fileName: newName}});
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
    const query = {meta: {sessionId}};
    return Files.remove(query);
  },
});
