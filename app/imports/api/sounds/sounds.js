import {FilesCollection} from 'meteor/ostrio:files';
import {createComment} from '../images/methods.js';
import {storagePath} from '../storagePath.js';

export const Sounds = new FilesCollection({
  collectionName: 'sounds',
  storagePath: `${storagePath}/sounds`, // persist in this spot
  allowClientCode: false, // Disallow remove files from Client
  onBeforeUpload(file) {
    if (file.size > 1000 && file.size <= 10098576 && /wav/i.test(file.extension)) {
      // 100Mb
      return true;
    } else {
      return `Invalid sound type/size: ${file.extension} ${file.size}`;
    }
  },

  onAfterUpload(file) {
    console.log(file)
    // console.log(file, file.link('original', '//'));
     // Sounds.findOne(id).link("original", "//")
    return;

    const googleParameters = {
      config: {
        enableWordTimeOffsets: true,
        profanityFilter: true,
        languageCode: 'en-US',
      },
      audio: {
        content: 'gs://cloud-samples-tests/speech/brooklyn.flac',
      },
    };
    const googleString = JSON.stringify(googleParameters, null, 4);

    const script = 'transcribe.sh';
    const util = Npm.require('util'),
      spawn = Npm.require('child_process').spawn,
      convert = spawn(`${process.env.PWD}/private/${script}`, [googleString]);

    // reference: https://github.com/VeliovGroup/Meteor-Files/wiki/addFile
    convert.stdout.on('data', function(data) {
      console.log(data);
      return;

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

            createComment.call(i, {
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

    // do transcription here, add as a a comment.
  },
});
