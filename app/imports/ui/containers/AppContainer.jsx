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
  const sub = Session.get('subscription');
  const reviewer = Session.get('reviewer');
  let data = {
    connected: Meteor.status().connected,
    user: Meteor.user(),
    loading: false,
    sessions: [],
    talks: [],
    comments: [],
    files: [],
    images: [],

    // Session data.
    reviewer,
    sub,
  };

  if (sub) {
    const sessions = Meteor.subscribe(`sessions.${sub.type}`, sub._id);
    const talks = Meteor.subscribe(`talks.${sub.type}`, sub._id);
    const comments = Meteor.subscribe(`comments.${sub.type}`, sub._id);
    const files = Meteor.subscribe(`files.${sub.type}`, sub._id);
    const images = Meteor.subscribe(`images.${sub.type}`, sub._id);
    data = Object.assign(data, {
      loading: [sessions, talks, comments, files, images].some(s => !s.ready()),
      sessions: Sessions.find({}, {sort: {created: -1}}).fetch(),
      talks: Talks.find({}, {sort: {created: -1}}).fetch(),
      comments: Comments.find({}, {sort: {name: 1}}).fetch(),
      files: Files.find({}, {sort: {name: 1}}).fetch(),
      images: Images.find({}, {sort: {name: 1}}).fetch(),
    });
  }

  return data;
})(App);
