import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session.js';
import {withTracker} from 'meteor/react-meteor-data';

import {Sessions} from '../../api/sessions/sessions.js';
import {Talks} from '../../api/talks/talks.js';
import {Comments} from '../../api/comments/comments.js';
import {Files} from '../../api/files/files.js';
import {Images} from '../../api/images/images.js';

import App from '../layouts/App.jsx';
import 'react-toastify/dist/ReactToastify.min.css';

export default withTracker(() => {
  let reviewer = Session.get('reviewer');
  let data = {
    user: Meteor.user(),
    connected: Meteor.status().connected,
    reviewer: reviewer,
    loading: false,
    sessions: [],
    talks: [],
    comments: [],
    files: [],
    images: [],
  };

  let sessions, talks, comments, files, images;
  if (Meteor.userId()) {
    sessions = Meteor.subscribe('sessions.all');
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
    files = Meteor.subscribe('files.session', session);
    images = Meteor.subscribe('images.session', session);
    data = Object.assign(data, {
      talks: Talks.find({}, {sort: {created: -1}}).fetch(),
      files: Files.find({}, {sort: {name: 1}}).fetch(),
      images: Images.find({}, {sort: {name: 1}}).fetch(),
    });
  }

  let talk = Session.get('talk');
  if (talk && reviewer) {
    sessions = Meteor.subscribe('sessions.all');
    files = Meteor.subscribe('files.talk', talk);
    images = Meteor.subscribe('images.talk', talk);
    comments = Meteor.subscribe('comments', talk);
    data = Object.assign(data, {
      loading: !sessions.ready(),
      sessions: Sessions.find({}, {sort: {created: -1}}).fetch(),
      talks: Talks.find({}, {sort: {created: -1}}).fetch(),
      comments: Comments.find({}, {sort: {name: 1}}).fetch(),
      files: Files.find({}, {sort: {name: 1}}).fetch(),
      images: Images.find({}, {sort: {name: 1}}).fetch(),
    });
  }

  return data;
})(App);
