import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';

export const Events = new Mongo.Collection('Events');

Events.deny({
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

Events.schema = new SimpleSchema({
  created: {type: Date},
  data: {type: String},
  type: {type: String, optional: true},
  talk: {type: String, optional: true},
  comment: {type: String, optional: true},
});

Events.attachSchema(Events.schema);
