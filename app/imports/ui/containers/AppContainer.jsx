import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session.js';
import {withTracker} from 'meteor/react-meteor-data';
import {Sessions} from '../../api/sessions/sessions.js';
import {Talks} from '../../api/talks/talks.js';
import {Comments} from '../../api/comments/comments.js';
import {Events} from '../../api/events/events.js';
import {Files} from '../../api/files/files.js';
import {Images} from '../../api/images/images.js';

import App from '../layouts/App.jsx';
import 'react-toastify/dist/ReactToastify.min.css';

export default withTracker(() => {
  let reviewer = Session.get('reviewer');
  let data = {
    user: Meteor.user(),
    reviewer,
    connected: Meteor.status().connected,
    loading: false,
    sessions: [],
    talks: [],
    comments: [],
    events: [],
    files: [],
    images: [],
  };

  let sessions, talks, comments, events, files, images;
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
    talks = Meteor.subscribe('talks', session);
    comments = Meteor.subscribe('comments', session);
    events = Meteor.subscribe('events', session);
    files = Meteor.subscribe('files', session);
    images = Meteor.subscribe('images', session);

    data = Object.assign(data, {
      sessions: Sessions.find(
        {userId: Meteor.userId()},
        {sort: {created: -1}},
      ).fetch(),
      talks: Talks.find({}, {sort: {created: -1}}).fetch(),
      comments: Comments.find({}, {sort: {created: 1}}).fetch(),
      events: Events.find({}, {sort: {created: -1}}).fetch(),
      files: Files.find({}, {sort: {name: 1}}).fetch(),
      images: Images.find({}, {sort: {name: 1}}).fetch(),
    });
  }

  let talk = Session.get('talk');
  if (talk) {
    // TODO - filter files by active session
    // TODO - filter images by active session
    console.log('talk is set', talk);
  }

  if (session && (Meteor.user() || reviewer)) {
    data = Object.assign(data, {
      loading: ![sessions, talks, comments, events, files, images].every(
        x => x && x.ready(),
      ),
    });
  }

  return data;
})(App);
