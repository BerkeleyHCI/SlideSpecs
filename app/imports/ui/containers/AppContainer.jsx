import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session.js';
import {withTracker} from 'meteor/react-meteor-data';

import {Talks} from '../../api/talks/talks.js';
import {Comments} from '../../api/comments/comments.js';
import {Files} from '../../api/files/files.js';
import {Images} from '../../api/images/images.js';
import {Sounds} from '../../api/sounds/sounds.js';

import App from '../layouts/App.jsx';
import 'react-toastify/dist/ReactToastify.min.css';

export default withTracker(() => {
  const sub = Session.get('subscription');
  const reviewer = Session.get('reviewer');
  let data = {
    connected: Meteor.status().connected,
    user: Meteor.user(),
    loading: false,
    talks: [],
    comments: [],
    files: [],
    images: [],
    sounds: [],

    // Session data.
    reviewer,
    sub,
  };

  if (sub) {
    const talks = Meteor.subscribe(`talks.${sub.type}`, sub._id);
    const comments = Meteor.subscribe(`comments.${sub.type}`, sub._id);
    const files = Meteor.subscribe(`files.${sub.type}`, sub._id);
    const images = Meteor.subscribe(`images.${sub.type}`, sub._id);
    const sounds = Meteor.subscribe(`sounds.${sub.type}`, sub._id);
    data = Object.assign(data, {
      loading: [talks, comments, files, images].some(s => !s.ready()),
      talks: Talks.find({}, {sort: {created: -1}}).fetch(),
      comments: Comments.find({}, {sort: {name: 1}}).fetch(),
      files: Files.find({}, {sort: {name: 1}}).fetch(),
      images: Images.find({}, {sort: {name: 1}}).fetch(),
      sounds: Sounds.find({}, {sort: {'meta.created': -1}}).fetch(),
    });
  }

  return data;
})(App);
