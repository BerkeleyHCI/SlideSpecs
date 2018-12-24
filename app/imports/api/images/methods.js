import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {Images} from './images.js';

export const renameImage = new ValidatedMethod({
  name: 'images.rename',
  validate: new SimpleSchema({
    imageId: {type: String},
    newName: {type: String},
  }).validator(),
  run({imageId, newName}) {
    this.unblock(); // <-- Use to make this method asynchronous
    const good = Images.collection.update(imageId, {$set: {name: newName}});
    return good;
  },
});

export const deleteImage = new ValidatedMethod({
  name: 'images.delete',
  validate: new SimpleSchema({
    imageId: {type: String},
  }).validator(),
  run({imageId}) {
    try {
      Images.remove(imageId);
    } catch (e) {
      console.error(e);
    }
  },
});

export const deleteSessionImages = new ValidatedMethod({
  name: 'images.deleteSessionImages',
  validate: new SimpleSchema({
    sessionId: {type: String},
  }).validator(),
  run({sessionId}) {
    try {
      Images.remove({'meta.sessionId': sessionId});
    } catch (e) {
      console.error(e);
    }
  },
});
