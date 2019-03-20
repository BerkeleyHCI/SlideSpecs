import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';

import {Talks} from '../talks/talks.js';
import {storagePath} from '../storagePath.js';
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

export const mergeSounds = new ValidatedMethod({
  name: 'sounds.merge',
  validate: new SimpleSchema({
    talkId: {type: String},
  }).validator(),
  run({talkId}) {
    const talk = Talks.findOne(talkId);
    if (talk) {
      const sounds = Sounds.find({'meta.talkId': talkId}).fetch();
      const sName = sounds.map(s => s.path);
      const fName = `${storagePath}/sounds/${talkId}-${Date.now()}.wav`;
      const args = [fName, ...sName];
      console.log(args);
      return;

      const util = Npm.require('util'),
        spawn = Npm.require('child_process').spawn,
        convert = spawn(`${process.env.PWD}/private/${script}`, args);

      convert.stdout.on('data', function(data) {
        console.log('stdout: ' + data);
      });

      convert.stderr.on('data', function(data) {
        console.log('stderr: ' + data);
      });

      convert.on('exit', function(code) {
        console.log('child process exited with code ' + code);
        return;

        console.log('adding merged file: ' + fName);
        Sounds.addFile(i, {
          fName,
          type: 'audio/wav',
          userId: talk.userId,
          meta: {talkId, complete: true},
        });
      });
    } else {
      console.error('no talk found.');
    }
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
