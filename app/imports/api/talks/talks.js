import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';

class TalksCollection extends Mongo.Collection {
  insert(talk, callback) {
    if (!talk.name) {
      const basename = 'talk ';
      let iter = new Date().toLocaleDateString();
      talk.name = `${basename} ${iter}`;
    }
    return super.insert(talk, callback);
  }
}

export const Talks = new TalksCollection('Talks');

Talks.deny({
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

Talks.schema = new SimpleSchema({
  name: {type: String},
  created: {type: Date},
  userId: {type: String, regEx: SimpleSchema.RegEx.Id},
  session: {type: String, regEx: SimpleSchema.RegEx.Id},
  responding: {type: String, defaultValue: '', optional: true},
});

Talks.attachSchema(Talks.schema);
