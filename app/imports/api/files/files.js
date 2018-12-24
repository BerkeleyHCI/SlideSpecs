import {Meteor} from 'meteor/meteor';
import {FilesCollection} from 'meteor/ostrio:files';

// TODO make save folder dynamic, or relative?...
const storagePath = '/Users/jwrnr/Downloads/peer-feedback/';

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
        storagePath + 'images',
      ]);

    convert.stdout.on('data', function(data) {
      console.log('stdout: ' + data);
    });

    convert.stderr.on('data', function(data) {
      console.log('stderr: ' + data);
    });

    convert.on('exit', function(code) {
      console.log('child process exited with code ' + code);
    });
  },
});
