import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {Factory} from 'meteor/factory';
import {Todos} from '../todos/todos.js';

class SessionsCollection extends Mongo.Collection {
  insert(session, callback) {
    const ourList = session;
    if (!ourList.name) {
      const defaultName = 'deck';
      let nextLetter = 'a';
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
    Todos.remove({sessionId: selector});
    return super.remove(selector, callback);
  }
}

export const Sessions = new SessionsCollection('Sessions');

// Deny all client-side updates since we will be using methods to manage this collection
Sessions.deny({
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

Sessions.schema = new SimpleSchema({
  name: {type: String},
  incompleteCount: {type: Number, defaultValue: 0},
  userId: {type: String, regEx: SimpleSchema.RegEx.Id, optional: true},
});

Sessions.attachSchema(Sessions.schema);

// This represents the keys from Sessions objects that should be published
// to the client. If we add secret properties to List objects, don't session
// them here to keep them private to the server.
Sessions.publicFields = {
  name: 1,
  incompleteCount: 1,
  userId: 1,
};

Factory.define('session', Sessions, {});

Sessions.helpers({
  // A session is considered to be private if it has a userId set
  isPrivate() {
    return !!this.userId;
  },
  isLastPublicList() {
    const publicListCount = Sessions.find({userId: {$exists: false}}).count();
    return !this.isPrivate() && publicListCount === 1;
  },
  editableBy(userId) {
    if (!this.userId) {
      return true;
    }

    return this.userId === userId;
  },
  todos() {
    return Todos.find({sessionId: this._id}, {sort: {createdAt: -1}});
  },
});
