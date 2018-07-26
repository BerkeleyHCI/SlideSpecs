import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {Factory} from 'meteor/factory';
import {Todos} from '../todos/todos.js';

import {Meteor} from 'meteor/meteor';
import {FilesCollection} from 'meteor/ostrio:files';

// Deny all client-side updates since we will be using methods to manage this collection
Files.deny({
  insert() {
    return true;
  },
  update() {
    return true;
  },
  remove() {
    return true;
  },
});

Files.schema = new SimpleSchema({
  name: {type: String},
  incompleteCount: {type: Number, defaultValue: 0},
  userId: {type: String, regEx: SimpleSchema.RegEx.Id, optional: true},
});

Files.attachSchema(Files.schema);

// This represents the keys from Files objects that should be published
// to the client. If we add secret properties to List objects, don't list
// them here to keep them private to the server.
Files.publicFields = {
  name: 1,
  incompleteCount: 1,
  userId: 1,
};

Factory.define('list', Files, {});

Files.helpers({
  // A list is considered to be private if it has a userId set
  isPrivate() {
    return !!this.userId;
  },
  isLastPublicList() {
    const publicListCount = Files.find({userId: {$exists: false}}).count();
    return !this.isPrivate() && publicListCount === 1;
  },
  editableBy(userId) {
    if (!this.userId) {
      return true;
    }

    return this.userId === userId;
  },
  todos() {
    return Todos.find({listId: this._id}, {sort: {createdAt: -1}});
  },
});

// New code

const Images = new FilesCollection({
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

if (Meteor.isClient) {
  Meteor.subscribe('files.images.all');
}

if (Meteor.isServer) {
  Meteor.publish('files.images.all', function() {
    return Images.find().cursor;
  });
}

export const Files = new FilesCollection('Files');
