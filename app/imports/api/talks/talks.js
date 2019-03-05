import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';

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
  progress: {type: Number, optional: true}, // for uploads
  secret: {type: String, regEx: SimpleSchema.RegEx.Id}, 
  userId: {type: String, regEx: SimpleSchema.RegEx.Id},
});

Talks.attachSchema(Talks.schema);
