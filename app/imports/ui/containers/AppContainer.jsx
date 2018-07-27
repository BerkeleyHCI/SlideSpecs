import {Meteor} from 'meteor/meteor';
import {ReactiveVar} from 'meteor/reactive-var';
import {withTracker} from 'meteor/react-meteor-data';
import {Lists} from '../../api/lists/lists.js';
import {Files} from '../../api/files/files.js';

import App from '../layouts/App.jsx';

const menuOpen = new ReactiveVar(false);

export default withTracker(() => {
  const pubH = Meteor.subscribe('lists.public');
  const privH = Meteor.subscribe('lists.private');
  const pubF = Meteor.subscribe('files.public');
  const privF = Meteor.subscribe('files.private');

  return {
    user: Meteor.user(),
    loading: ![pubH, privH, pubF, privF].every(x => x.ready()),
    connected: Meteor.status().connected,
    menuOpen,
    lists: Lists.find({
      $or: [{userId: {$exists: false}}, {userId: Meteor.userId()}],
    }).fetch(),
    files: Files.find({}),
  };
})(App);
