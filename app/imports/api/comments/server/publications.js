import {Meteor} from 'meteor/meteor';
import {Comments} from '../comments.js';

Meteor.publish('comments', session => Comments.find({session: session}));
