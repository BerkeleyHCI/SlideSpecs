import {Promise} from 'meteor/promise';

import {storagePath, bucketName} from '../imports/api/storagePath.js';
import {Talks} from '../imports/api/talks/talks.js';
import {Sounds} from '../imports/api/sounds/sounds.js';
import {gAudio} from '../imports/api/gAudio/gAudio.js';

Meteor.methods({
  async mergeSounds(talkId) {
    check(talkId, String);
    const talk = Talks.findOne(talkId);
    if (!(talk && Meteor.user() && Meteor.userId() === talk.userId)) {
      return console.error('no talk found.');
    }

    const sounds = Sounds.find(
      {'meta.talkId': talkId, 'meta.complete': {$ne: true}},
      {sort: {'meta.created': 1}},
    ).fetch();
    const sName = sounds.map(s => s.path);
    const fName = `${storagePath}/sounds/${talkId}-${Date.now()}.flac`;
    const fileName = fName.substring(fName.lastIndexOf('/') + 1);
    const args = [fName, ...sName];

    const useTranscript = data => {
      console.log(data);
    };

    const gatherTranscript = (results, err) => {
      const res = results[0];
      if (res) {
        const name = res.latestResponse.name;
        console.log(name);
      } else {
        console.error(err);
      }
    };

    const runGoogle = () => {
      const gcsURI = `gs://${bucketName}/${fileName}`;
      const speech = Npm.require('@google-cloud/speech');
      const client = new speech.SpeechClient();
      const config = {
        encoding: 'FLAC',
        sampleRateHertz: 16000,
        languageCode: 'en-US',
        enableWordTimeOffsets: true,
        model: 'video',
      };

      const request = {config, audio: {uri: gcsURI}};
      const [operation] = Promise.await(client.longRunningRecognize(request));
      const [response] = Promise.await(operation.promise());
      const transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');

      console.log(`Transcription: ${transcription}`);
      console.log(response.results);
    };

    const addGoogle = () => {
      console.log('adding merged file: ' + fileName);
      const meta = {
        fileName,
        type: 'audio/wav',
        userId: talk.userId,
        meta: {talkId, complete: true, created: Date.now()},
      };

      // add to both sounds (complete) and to google audio for transcription.
      Sounds.addFile(fName, meta);
      gAudio.addFile(fName, meta);
      const gOptions = {
        destination: fileName,
        gzip: true,
        metadata: {
          ...meta,
          cacheControl: 'public, max-age=31536000',
        },
      };

      const {Storage} = Npm.require('@google-cloud/storage');
      const storage = new Storage();
      storage
        .bucket(bucketName)
        .upload(fName, gOptions)
        .then(runGoogle)
        .catch(console.error);
    };

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
        addGoogle();
      } else {
        return false;
      }
    });
  },
});
