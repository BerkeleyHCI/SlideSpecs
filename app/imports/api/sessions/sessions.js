import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {Random} from 'meteor/random';

export const Sessions = new Mongo.Collection('Sessions');

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
  talks: {type: [String]},
  userId: {type: String, regEx: SimpleSchema.RegEx.Id},
});

Sessions.attachSchema(Sessions.schema);
