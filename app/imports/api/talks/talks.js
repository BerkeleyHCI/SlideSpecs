import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {Random} from 'meteor/random';

export const Talks = new Mongo.Collection('Talks');

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
  ordering: {type: Number},
  userId: {type: String, regEx: SimpleSchema.RegEx.Id},
  session: {type: String, regEx: SimpleSchema.RegEx.Id},
});

Talks.attachSchema(Talks.schema);
