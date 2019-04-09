import {Promise} from 'meteor/promise';
import _ from 'lodash';

import {storagePath, bucketName} from '../imports/api/storagePath.js';
import {Talks} from '../imports/api/talks/talks.js';
import {Sounds} from '../imports/api/sounds/sounds.js';
import {gAudio} from '../imports/api/gAudio/gAudio.js';

import {
  generateCommentRegions,
  generateWordFreq,
  setAudioStart,
} from '../imports/api/talks/methods.js';
import {createTranscript} from '../imports/api/transcripts/methods.js';

Meteor.methods({
  async transribeSound(talkId, fileName) {
    check(talkId, String);
    check(fileName, String);
    const talk = Talks.findOne(talkId);

    if (!(talk && Meteor.user() && Meteor.userId() === talk.userId)) {
      return console.error('no talk found.');
    }

    // the talk exists
    setAudioStart.call({talkId: talk._id});
    generateCommentRegions.call({talkId: talk._id});
    const wordFreq = generateWordFreq.call({talkId: talk._id});
    const wordList = wordFreq.filter(wf => wf.count >= 2).map(wf => wf.word);

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
        sampleRateHertz: 44100,
        languageCode: 'en-US',
        profanityFilter: true,
        enableWordTimeOffsets: true,
        enableAutomaticPunctuation: true,
        enableSpeakerDiarization: true,
        diarizationSpeakerCount: 1,
        model: 'video', // only one of these
        //model: 'default', // only one of these
        //model: 'phone_call', // only one of these
        //useEnhanced: true, // add this w/ phone
        speechContexts: [{phrases: wordList}],
      };

      const request = {config, audio: {uri: gcsURI}};
      const [operation] = Promise.await(client.longRunningRecognize(request));
      const [response] = Promise.await(operation.promise());
      const results = response.results;
      const transcript = results
        .map(result => result.alternatives[0].transcript)
        .join('\n');
      //.toLowerCase();

      let confAggregate = results.map(r => r.alternatives[0].confidence);
      const confidence = _.sum(confAggregate) / confAggregate.length;

      let words = _.flatten(
        results.map(result => result.alternatives[0].words),
      ).map(res => {
        const genTimeObj = time => {
          const seconds = time.seconds ? parseInt(time.seconds) : 0;
          const nanos = time.nanos ? time.nanos : 0;
          return parseFloat(`${seconds}.${nanos}`);
        };

        return {
          word: res.word,
          //word: res.word.toLowerCase(),
          startTime: genTimeObj(res.startTime),
          endTime: genTimeObj(res.endTime),
        };
      });

      //console.log(JSON.stringify(words, null, 2));
      const transcriptsOptions = {
        transcript,
        results: words,
        confidence,
        talk: talk._id,
      };

      if (transcript) {
        console.log('adding transcript: ', transcript);
        console.log({confidence});
        createTranscript.call(transcriptsOptions);
      } else {
        console.error('empty transcript');
      }
    };

    const addGoogle = () => {
      console.log('adding merged file: ' + fileName);
      const meta = {
        fileName,
        type: 'audio/flac',
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

    addGoogle();
  },

  //
  // For combining browser audio.
  //
  async mergeSounds(talkId) {
    check(talkId, String);
    const talk = Talks.findOne(talkId);

    if (!(talk && Meteor.user() && Meteor.userId() === talk.userId)) {
      return console.error('no talk found.');
    }

    // the talk exists
    setAudioStart.call({talkId: talk._id});
    generateCommentRegions.call({talkId: talk._id});
    const wordFreq = generateWordFreq.call({talkId: talk._id});
    const wordList = wordFreq.filter(wf => wf.count >= 2).map(wf => wf.word);
    //console.log(wordList);

    const sounds = Sounds.find(
      {'meta.talkId': talkId, 'meta.complete': {$ne: true}},
      {sort: {'meta.created': 1}},
    ).fetch();
    const sName = sounds.map(s => s.path);
    const fName = `${storagePath}/sounds/${talkId}-${Date.now()}.flac`;
    const fileName = fName.substring(fName.lastIndexOf('/') + 1);
    const args = [fName, ...sName];

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
        sampleRateHertz: 44100,
        languageCode: 'en-US',
        profanityFilter: true,
        enableWordTimeOffsets: true,
        enableAutomaticPunctuation: true,
        enableSpeakerDiarization: true,
        diarizationSpeakerCount: 1,
        model: 'video', // only one of these
        //model: 'default', // only one of these
        //model: 'phone_call', // only one of these
        //useEnhanced: true, // add this w/ phone
        speechContexts: [{phrases: wordList}],
      };

      const request = {config, audio: {uri: gcsURI}};
      const [operation] = Promise.await(client.longRunningRecognize(request));
      const [response] = Promise.await(operation.promise());
      const results = response.results;
      const transcript = results
        .map(result => result.alternatives[0].transcript)
        .join('\n');
      //.toLowerCase();

      let confAggregate = results.map(r => r.alternatives[0].confidence);
      const confidence = _.sum(confAggregate) / confAggregate.length;

      let words = _.flatten(
        results.map(result => result.alternatives[0].words),
      ).map(res => {
        const genTimeObj = time => {
          const seconds = time.seconds ? parseInt(time.seconds) : 0;
          const nanos = time.nanos ? time.nanos : 0;
          return parseFloat(`${seconds}.${nanos}`);
        };

        return {
          word: res.word,
          //word: res.word.toLowerCase(),
          startTime: genTimeObj(res.startTime),
          endTime: genTimeObj(res.endTime),
        };
      });

      //console.log(JSON.stringify(words, null, 2));
      const transcriptsOptions = {
        transcript,
        results: words,
        confidence,
        talk: talk._id,
      };

      if (transcript) {
        console.log('adding transcript: ', transcript);
        console.log({confidence});
        createTranscript.call(transcriptsOptions);
      } else {
        console.error('empty transcript');
      }
    };

    const addGoogle = () => {
      console.log('adding merged file: ' + fileName);
      const meta = {
        fileName,
        type: 'audio/flac',
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
