/* eslint-disable prefer-arrow-callback */

import {Meteor} from 'meteor/meteor';
import {Sessions} from '../sessions.js';

Meteor.publish('sessions', () => Sessions.find({}));
