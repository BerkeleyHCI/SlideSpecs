import {Promise} from 'meteor/promise';
import _ from 'lodash';

import {storagePath, bucketName} from '../imports/api/storagePath.js';
import {Talks} from '../imports/api/talks/talks.js';
import {Sounds} from '../imports/api/sounds/sounds.js';
import {gAudio} from '../imports/api/gAudio/gAudio.js';

import {createTranscript} from '../imports/api/transcripts/methods.js';
import {
  generateCommentRegions,
  generateWordFreq,
  setAudioStart,
} from '../imports/api/talks/methods.js';

// TODO trim this so that only the async parts are exposed as meteor method,
// then call it from a collection method rather than using meteor.methods

Meteor.methods({
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

    const runGoogle = () => {
      const gcsURI = `gs://${bucketName}/${fileName}`;
      const speech = Npm.require('@google-cloud/speech').v1p1beta1;
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
      gAudio.addFile(fName, meta); // todo is this doing anything??
      const gOptions = {
        destination: fileName,
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

  async transcribeSounds(talkId, fileId) {
    check(talkId, String);
    check(fileId, String);
    const talk = Talks.findOne(talkId);
    const fileName = `${fileId}.flac`;
    const fName = `${storagePath}/sounds/${fileName}`;

    if (!(talk && Meteor.user() && Meteor.userId() === talk.userId)) {
      return console.error('no talk found.');
    }

    setAudioStart.call({talkId: talk._id});
    generateCommentRegions.call({talkId: talk._id});
    const wordFreq = generateWordFreq.call({talkId: talk._id});
    const wordList = wordFreq.filter(wf => wf.count >= 2).map(wf => wf.word);

    const runGoogle = () => {
      const gcsURI = `gs://${bucketName}/${fileName}`;
      const speech = Npm.require('@google-cloud/speech').v1p1beta1;
      const client = new speech.SpeechClient();
      const config = {
        encoding: 'FLAC',
        profanityFilter: true,
        sampleRateHertz: 44100,
        languageCode: 'en-US',
        enableWordTimeOffsets: true,
        enableAutomaticPunctuation: true,
        speechContexts: [{phrases: wordList}],
      };

      //enableSpeakerDiarization: true,
      //diarizationSpeakerCount: 1,
      //model: 'video', // enhanced
      //model: 'default', // only one of these
      //model: 'phone_call', // only one of these
      //useEnhanced: true, // add this w/ phone

      const request = {config, audio: {uri: gcsURI}};
      const [operation] = Promise.await(client.longRunningRecognize(request));
      const [response] = Promise.await(operation.promise());

      const results = response.results;
      const transcript = results
        .map(result => result.alternatives[0].transcript)
        .join('\n');

      let confAggregate = results.map(r => r.alternatives[0].confidence);
      const confidence = _.sum(confAggregate) / confAggregate.length;

      let words = _.flatten(
        results.map(result => result.alternatives[0].words),
      ).map(res => {
        const genTime = time => {
          const seconds = time.seconds ? parseInt(time.seconds) : 0;
          const nanos = time.nanos ? time.nanos : 0;
          return parseFloat(`${seconds}.${nanos}`);
        };

        const wordData = {
          word: res.word,
          startTime: genTime(res.startTime),
          endTime: genTime(res.endTime),
        };

        console.log(res, wordData);
        return wordData;
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

    // Main section of this method.
    console.log('adding uploaded audio file: ' + fileName);
    const meta = {
      fileName,
      type: 'audio/flac',
      userId: talk.userId,
      meta: {talkId, complete: true, created: Date.now()},
    };

    const gOptions = {
      destination: fileName,
      metadata: {
        ...meta,
        cacheControl: 'public, max-age=31536000000',
      },
    };

    const {Storage} = Npm.require('@google-cloud/storage');
    const storage = new Storage();
    storage
      .bucket(bucketName)
      .upload(fName, gOptions)
      .then(runGoogle)
      .catch(console.error);
  },
});
