import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';

export const Comments = new Mongo.Collection('Comments');

// Deny all client-side updates since we use methods to manage this collection

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

const SlideSchema = new SimpleSchema({
  slideNo: {type: String},
  slideId: {type: String},
});

Comments.schema = new SimpleSchema({
  created: {type: Date},
  author: {type: String},
  content: {type: String},
  talk: {type: SimpleSchema.RegEx.Id},
  slides: {type: [SlideSchema]},
  agree: {type: [String], defaultValue: []},
  discuss: {type: [String], defaultValue: []},
  userOwn: {type: Boolean, defaultValue: false, optional: true},
  addressed: {type: Boolean, defaultValue: false, optional: true},
  completed: {type: Boolean, defaultValue: false, optional: true},
  sounds: {type: [String], defaultValue: [], optional: true},
});

Comments.attachSchema(Comments.schema);
