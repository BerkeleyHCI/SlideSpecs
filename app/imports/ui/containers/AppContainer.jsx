import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session.js';
import {withTracker} from 'meteor/react-meteor-data';
import {Sessions} from '../../api/sessions/sessions.js';
import {Comments} from '../../api/comments/comments.js';
import {Files} from '../../api/files/files.js';
import {Events} from '../../api/events/events.js';

import App from '../layouts/App.jsx';
import 'react-toastify/dist/ReactToastify.min.css';

export default withTracker(() => {
  let reviewer = Session.get('reviewer');
  let data = {
    user: Meteor.user(),
    reviewer,
    connected: Meteor.status().connected,
    loading: false,
    comments: [],
    sessions: [],
    events: [],
    files: [],
  };

  let sessions, files, comments, events;
  if (Meteor.user() || reviewer) {
    sessions = Meteor.subscribe('sessions');
    data = Object.assign(data, {
      loading: !sessions.ready(),
      sessions: Sessions.find(
        {userId: Meteor.userId()},
        {sort: {created: -1}},
      ).fetch(),
    });
  }

  let session = Session.get('session');
  if (session) {
    // TODO - filter files by active session
    files = Meteor.subscribe('files');
    comments = Meteor.subscribe('comments', session);
    events = Meteor.subscribe('events', session);
    data = Object.assign(data, {
      events: Events.find({}, {sort: {created: -1}}).fetch(),
      comments: Comments.find({}, {sort: {created: 1}}).fetch(),
      files: Files.find({}, {sort: {name: 1}}).fetch(),
      sessions: Sessions.find(
        {userId: Meteor.userId()},
        {sort: {created: -1}},
      ).fetch(),
    });
  }

  if (session && (Meteor.user() || reviewer)) {
    data = Object.assign(data, {
      loading: ![sessions, comments, files, events].every(x => x && x.ready()),
    });
  }

  return data;
})(App);
