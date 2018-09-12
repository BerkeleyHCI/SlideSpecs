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
  const sessions = Meteor.subscribe('sessions');
  const files = Meteor.subscribe('files');
  const comments = Meteor.subscribe('comments');
  const events = Meteor.subscribe('events');
  let reviewer = Session.get('reviewer');
  return {
    user: Meteor.user(),
    reviewer,
    connected: Meteor.status().connected,
    loading: ![sessions, comments, files, events].every(x => x.ready()),
    events: Events.find({}, {sort: {created: -1}}).fetch(),
    comments: Comments.find(
      {
        $or: [
          {userOwn: {$ne: true}},
          {
            $and: [
              {userOwn: {$eq: true}},
              {author: {$in: ['system', reviewer]}},
            ],
          },
        ],
      },
      {sort: {created: 1}},
    ).fetch(),
    files: Files.find({}, {sort: {name: 1}}).fetch(),
    sessions: Sessions.find(
      {userId: Meteor.userId()},
      {sort: {created: -1}},
    ).fetch(),
  };
})(App);
