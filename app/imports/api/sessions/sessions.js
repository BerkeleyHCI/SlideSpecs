import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {Random} from 'meteor/random';

class SessionsCollection extends Mongo.Collection {
  insert(session, callback) {
    let ourSess = session;
    if (!ourSess.name) {
      const basename = 'session ';
      let iter = new Date().toLocaleDateString();
      ourSess.name = `${basename} ${iter}`;
    }

    // TODO create random unique Id and assign to secret, use that instead of
    // regular item ID. to be used for the presenter talk additions URL.

    return super.insert(ourSess, callback);
  }
}

export const Sessions = new SessionsCollection('Sessions');

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
