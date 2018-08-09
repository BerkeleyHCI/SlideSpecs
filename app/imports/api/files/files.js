import {Meteor} from 'meteor/meteor';
import {FilesCollection} from 'meteor/ostrio:files';

export const Files = new FilesCollection({
  collectionName: 'files',
  allowClientCode: false, // Disallow remove files from Client
  onBeforeUpload(file) {
    // Allow upload files under 10MB, and only in png/jpg/jpeg formats
    if (file.size <= 10485760 && /png|jpg|jpeg/i.test(file.extension)) {
      return true;
    } else {
      return 'Please only upload images, with size equal or less than 10MB.';
    }
  },
});

// TODO - attach a schema
// simpleschema reference
