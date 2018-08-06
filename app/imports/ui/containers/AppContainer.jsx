import {Meteor} from 'meteor/meteor';
import {withTracker} from 'meteor/react-meteor-data';
import {Sessions} from '../../api/sessions/sessions.js';
import {Files} from '../../api/files/files.js';
import App from '../layouts/App.jsx';

export default withTracker(() => {
  const sessions = Meteor.subscribe('sessions');
  const files = Meteor.subscribe('files');
  return {
    user: Meteor.user(),
    loading: ![sessions, files].every(x => x.ready()),
    connected: Meteor.status().connected,
    sessions: Sessions.find({}, {sort: {name: 1}}).fetch(),
    files: Files.find({}, {sort: {name: 1}}).fetch(),
  };
})(App);
