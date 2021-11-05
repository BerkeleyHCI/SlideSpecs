import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {Files} from './files.js';
import {Images} from '../images/images.js';
import {Talks} from '../talks/talks.js';
import {Comments} from '../comments/comments.js';

// TODO - include file creation method here
// TODO - restrict these operations to file owner
// TODO - delete the files from a presentation

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
    try {
      Files.remove(fileId);
    } catch (e) {
      console.error(e);
    }
  },
});

export const deleteTalkFiles = new ValidatedMethod({
  name: 'files.deleteTalkFiles',
  validate: new SimpleSchema({
    talkId: {type: String},
  }).validator(),
  run({talkId}) {
    try {
      Files.remove({'meta.sessionId': sessionId});
      Images.remove({'meta.sessionId': sessionId});
      Talks.remove({session: sessionId});
      Comments.remove({session: sessionId});
    } catch (e) {
      console.error(e);
    }
  },
});
