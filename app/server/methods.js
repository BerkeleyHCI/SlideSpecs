import {storagePath} from '../imports/api/storagePath.js';
import {Talks} from '../imports/api/talks/talks.js';
import {Sounds} from '../imports/api/sounds/sounds.js';

Meteor.methods({
  mergeSounds(talkId) {
    check(talkId, String);
    const talk = Talks.findOne(talkId);
    if (talk && Meteor.user() && Meteor.userId() === talk.userId) {
      const sounds = Sounds.find({'meta.talkId': talkId}).fetch();
      const sName = sounds.map(s => s.path);
      const fName = `${storagePath}/sounds/${talkId}-${Date.now()}.wav`;
      const args = [fName, ...sName];
      const util = Npm.require('util'),
        spawn = Npm.require('child_process').spawn,
        convert = spawn(`${process.env.PWD}/private/convert-wav`, args);

      convert.stdout.on('data', function(data) {
        console.log('stdout: ' + data);
      });

      convert.stderr.on('data', function(data) {
        console.log('stderr: ' + data);
      });

      convert.on('exit', function(code) {
        console.log('child process exited with code ' + code);
        if (code === 0) {
          const fileName = fName.substring(fName.lastIndexOf('/') + 1);
          console.log('adding merged file: ' + fileName);
          Sounds.addFile(fName, {
            fileName,
            type: 'audio/wav',
            userId: talk.userId,
            meta: {talkId, complete: true},
          });
          return true;
        } else {
          return false;
        }
      });
    } else {
      console.error('no talk found.');
    }
  },
});
