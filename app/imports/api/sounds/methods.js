import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {Sounds} from './sounds.js';

export const renameSound = new ValidatedMethod({
  name: 'sounds.rename',
  validate: new SimpleSchema({
    soundId: {type: String},
    newName: {type: String},
  }).validator(),
  run({soundId, newName}) {
    this.unblock();
    const good = Sounds.collection.update(soundId, {$set: {name: newName}});
    return good;
  },
});

export const updateSound = new ValidatedMethod({
  name: 'sounds.update',
  validate: new SimpleSchema({
    soundId: {type: String},
    transcript: {type: String},
    results: {type: String},
  }).validator(),
  run({soundId, transcript, results}) {
    this.unblock();
    Sounds.collection.update(soundId, {
      $set: {
        'meta.transcript': transcript,
        'meta.results': results,
      },
    });
    return true;
  },
});

export const deleteSound = new ValidatedMethod({
  name: 'sounds.delete',
  validate: new SimpleSchema({
    soundId: {type: String},
  }).validator(),
  run({soundId}) {
    try {
      Sounds.remove(soundId);
    } catch (e) {
      console.error(e);
    }
  },
});

export const deleteTalkSounds = new ValidatedMethod({
  name: 'sounds.deleteTalkSounds',
  validate: new SimpleSchema({
    talkId: {type: String},
  }).validator(),
  run({talkId}) {
    try {
      Sounds.remove({'meta.talkId': talkId});
    } catch (e) {
      console.error(e);
    }
  },
});
