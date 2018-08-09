import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {withTracker} from 'meteor/react-meteor-data';
import {Sessions} from '../../api/sessions/sessions.js';
import {Comments} from '../../api/comments/comments.js';
import {Files} from '../../api/files/files.js';
import App from '../layouts/App.jsx';

export default withTracker(() => {

  const sessions = Meteor.subscribe('sessions');
  const comments = Meteor.subscribe('comments');
  const files = Meteor.subscribe('files');
  return {
    user: Meteor.user(),
    loading: ![sessions, files].every(x => x.ready()),
    connected: Meteor.status().connected,
    reviewer: Session.get('name'),
    sessions: Sessions.find(
      {userId: Meteor.userId()},
      {sort: {created: -1}},
    ).fetch(),
    comments: Comments.find({}, {sort: {created: 1}}).fetch(),
    files: Files.find({}, {sort: {name: 1}}).fetch(),
  };
})(App);
