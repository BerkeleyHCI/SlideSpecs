import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {Factory} from 'meteor/factory';
import {Todos} from '../todos/todos.js';
import {Meteor} from 'meteor/meteor';
import {FilesCollection} from 'meteor/ostrio:files';

// New code

const Files = new FilesCollection({
  collectionName: 'Images',
  allowClientCode: false, // Disallow remove files from Client
  onBeforeUpload(file) {
    // Allow upload files under 10MB, and only in png/jpg/jpeg formats
    if (file.size <= 10485760 && /png|jpg|jpeg/i.test(file.extension)) {
      return true;
    }
    return 'Please upload image, with size equal or less than 10MB';
  },
});

/*
  Meteor.subscribe('files.images.all');
  Meteor.publish('files.images.all', function() {
    return Images.find().cursor;
  });
 * */

export default Files;
