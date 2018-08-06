import {Mongo} from 'meteor/mongo';
import {Factory} from 'meteor/factory';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';

class SessionsCollection extends Mongo.Collection {
  insert(session, callback) {
    let ourSess = session;
    if (!ourSess.name) {
      const basename = 'session ';
      let iter = Date.now().toLocaleString();
      ourSess.name = `${basename} ${iter}`;
    }
    return super.insert(ourSess, callback);
  }

  remove(selector, callback) {
    // TODO: Remove all slides related to this session
    // Files.remove({session: ourSess.id})
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
  created: {type: Date},
  userId: {type: String, regEx: SimpleSchema.RegEx.Id},
});

Sessions.attachSchema(Sessions.schema);

Factory.define('session', Sessions, {});
