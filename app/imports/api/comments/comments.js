import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';

export const Comments = new Mongo.Collection('Comments');

// Deny all client-side updates since we will be using methods to manage this collection

Comments.deny({
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

Comments.schema = new SimpleSchema({
  created: {type: Date},
  author: {type: String},
  content: {type: String},
  session: {type: String},
  slides: {type: [SlideSchema]},
  agree: {type: [String], defaultValue: []},
  discuss: {type: [String], defaultValue: []},
  userOwn: {type: Boolean, defaultValue: false},
  addressed: {type: Boolean, defaultValue: false},
});

Comments.attachSchema(Comments.schema);
