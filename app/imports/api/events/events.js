import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';

export const Events = new Mongo.Collection('Events');

// Deny all client-side updates since we will be using methods to manage this collection

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

SlideSchema = new SimpleSchema({
  slideNo: {type: String},
  slideId: {type: String},
});

Events.schema = new SimpleSchema({
  created: {type: Date},
  author: {type: String},
  content: {type: String},
  session: {type: String},
  slides: {type: [SlideSchema]},
  agree: {type: [String], defaultValue: []},
  discuss: {type: [String], defaultValue: []},
});

Events.attachSchema(Events.schema);
