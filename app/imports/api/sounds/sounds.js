import {FilesCollection} from 'meteor/ostrio:files';
import {createComment} from '../comments/methods.js';
import {storagePath} from '../storagePath.js';
import {updateSound} from './methods.js';

export const Sounds = new FilesCollection({
  collectionName: 'sounds',
  storagePath: `${storagePath}/sounds`, // persist in this spot
  allowClientCode: false, // Disallow remove files from Client
  onBeforeUpload(file) {
    // needs to be under 10 mb for google to be happy
    if (
      file.size > 1000 &&
      file.size <= 10485760 &&
      /wav/i.test(file.extension)
    ) {
      return true;
    } else {
      return `Invalid sound type/size: ${file.extension} ${file.size}`;
    }
  },

  onAfterUpload(file) {
    const {target, talkId} = file.meta;
    console.log(target, talkId);

    const useTranscript = data => {
      let response = data[0];
      let transcript = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n')
        .trim();

      console.log(transcript);

      if (transcript) {
        const soundId = file._id;
        const results = JSON.stringify(response.results, null, 4);
        updateSound.call({soundId, transcript, results});
        return createComment.call({
          author: 'transcript',
          content: `[x](#c${target}) ${transcript}`,
          sounds: [soundId],
          talk: talkId,
          userOwn: true,
          slides: [],
        });
      }
    };

    const useFile = (err, content) => {
      const audioBytes = content.toString('base64');
      const audio = {
        content: audioBytes,
      };
      const config = {
        languageCode: 'en-US',
        enableWordTimeOffsets: true,
      };
      const request = {
        audio: audio,
        config: config,
      };

      // Detects speech in the audio file
      client
        .recognize(request)
        .then(useTranscript)
        .catch(console.error);
    };

    const speech = Npm.require('@google-cloud/speech'),
      fs = Npm.require('fs'),
      client = new speech.SpeechClient();
    fs.readFile(file.path, useFile);
  },
});

/*
  onAfterUpload(file) {
    //console.log(file);

    let script;
    if (/pdf$/i.test(file.extension)) {
      script = 'convert-pdf';
    } else {
      script = 'convert-slides';
    }

    const util = Npm.require('util'),
      spawn = Npm.require('child_process').spawn,
      convert = spawn(`${process.env.PWD}/private/${script}`, [
        file.path,
        storagePath,
      ]);

    // reference: https://github.com/VeliovGroup/Meteor-Files/wiki/addFile
    convert.stdout.on('data', function(data) {
      if (data.includes(file._id)) {
        var text = data.toString('utf8');
        const images = text.split('\n');
        images
          .filter(i => i.includes(file._id))
          .map(i => {
            console.log('adding image file: ' + i);
            const fileName = i.substring(i.lastIndexOf('/') + 1);

            // get slide number from image title
            const slideMatch = i.match(/\d+/g);
            if (!slideMatch) console.error('no slide matched', i);
            const slideNo = slideMatch.slice(-1)[0];

            Images.addFile(i, {
              fileName,
              type: 'image/png',
              userId: file.meta.userId,
              meta: {...file.meta, slideNo},
            });
          });
      } else {
        console.log('stdout: ' + data);
      }
    });

    convert.stderr.on('data', function(data) {
      console.log('stderr: ' + data);
    });

    convert.on('exit', function(code) {
      console.log('child process exited with code ' + code);
    });
  },
 * */
