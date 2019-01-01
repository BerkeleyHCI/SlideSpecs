import {Meteor} from 'meteor/meteor';
import {FilesCollection} from 'meteor/ostrio:files';
import {Images} from '../images/images.js';

// TODO make save folder dynamic//relative?...
const storagePath = '/Users/jwrnr/Downloads/peer-feedback/files/';
const imagePath = '/Users/jwrnr/Downloads/peer-feedback/images/';

export const Files = new FilesCollection({
  collectionName: 'files',
  storagePath: storagePath, // persist in this spot
  allowClientCode: false, // Disallow remove files from Client
  onBeforeUpload(file) {
    // Allow uploading files under 30MB for now.
    if (file.size <= 30985760 && /pdf|ppt|pptx|key/i.test(file.extension)) {
      return true;
    } else {
      return 'Please only upload pdf/ppt/pptx, with size equal or less than 30MB.';
    }
  },

  onAfterUpload(file) {
    console.log(file);

    let script;
    if (/pdf/i.test(file.extension)) {
      script = 'convert-pdf';
    } else {
      script = 'convert-slides';
    }

    var util = Npm.require('util'),
      spawn = Npm.require('child_process').spawn,
      convert = spawn(`${process.env.PWD}/private/${script}`, [
        file.path,
        imagePath,
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
            const slideNo = i.match(/\d+/g).slice(-1)[0]; // get slide number from image title
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
});
