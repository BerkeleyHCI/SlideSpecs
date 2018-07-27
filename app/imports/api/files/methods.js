import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {DDPRateLimiter} from 'meteor/ddp-rate-limiter';
import {_} from 'meteor/underscore';
import {Files} from './files.js';

export const remove = new ValidatedMethod({
  name: 'files.remove',
  validate: new SimpleSchema({
    fileId: {type: String},
  }).validator(),
  run({fileId}) {
    const file = Files.findOne(fileId);
    if (!file.editableBy(this.userId)) {
      throw new Meteor.Error(
        'files.rename.unauthorized',
        'Cannot rename file which is not yours',
      );
    }
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
    if (!file.editableBy(this.userId)) {
      throw new Meteor.Error(
        'files.rename.unauthorized',
        'Cannot rename file which is not yours',
      );
    }
    Todos.update(todoId, {$set: {name: newText}});
  },
});
