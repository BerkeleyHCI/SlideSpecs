import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {Factory} from 'meteor/factory';
import {Todos} from '../todos/todos.js';

class FilesCollection extends Mongo.Collection {
  insert(list, callback, locale = 'en') {
    const ourList = list;
    if (!ourList.name) {
      const defaultName = 'insert list';
      let nextLetter = 'A';
      ourList.name = `${defaultName} ${nextLetter}`;

      while (this.findOne({name: ourList.name})) {
        // not going to be too smart here, can go past Z
        nextLetter = String.fromCharCode(nextLetter.charCodeAt(0) + 1);
        ourList.name = `${defaultName} ${nextLetter}`;
      }
    }

    return super.insert(ourList, callback);
  }
  remove(selector, callback) {
    Todos.remove({listId: selector});
    return super.remove(selector, callback);
  }
}

export const Files = new FilesCollection('Files');

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
