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

Events.schema = new SimpleSchema({
  session: {type: String},
  slideNo: {type: Number},
  created: {type: Date},
});

Events.attachSchema(Events.schema);
