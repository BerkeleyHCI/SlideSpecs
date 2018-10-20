import {Meteor} from 'meteor/meteor';
import {Events} from '../events.js';

Meteor.publish('events', session => Events.find({session: session}));
