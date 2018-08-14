import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Meteor} from 'meteor/meteor';
import {BrowserRouter, Switch, Route, Link, Redirect} from 'react-router-dom';

import Loading from '../components/Loading.jsx';
import ConnectionNotification from '../components/ConnectionNotification.jsx';
import SessionContainer from '../containers/SessionContainer.jsx';
import ReviewContainer from '../containers/ReviewContainer.jsx';

import AuthPageSignIn from '../pages/AuthPageSignIn.jsx';
import AuthPageJoin from '../pages/AuthPageJoin.jsx';
import SessionListPage from '../pages/SessionListPage.jsx';
import FeedbackPage from '../pages/FeedbackPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import UploadPage from '../pages/UploadPage.jsx';

const CONNECTION_ISSUE_TIMEOUT = 5000;

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {showConnectionIssue: false};
  }

  componentDidMount() {
    setTimeout(() => {
      /* eslint-disable react/no-did-mount-set-state */
      this.setState({showConnectionIssue: true});
    }, CONNECTION_ISSUE_TIMEOUT);
  }

  renderSession = ({match}) => {
    if (!match) {
      return <Loading key="loading" />;
    } else {
      const sessionId = match.params.id;
      const {sessions, files, comments} = this.props;
      const session = sessions.find(s => s._id === sessionId);
      const sFiles = files.filter(f => f.meta.sessionId === sessionId);
      const sComments = comments.filter(c => c.session === sessionId);
      return (
        <SessionContainer {...session} files={sFiles} comments={sComments} />
      );
    }
  };

  renderUpload = ({match}) => {
    if (!match) {
      return <Loading key="loading" />;
    } else {
      const sessionId = match.params.id;
      const {sessions, files} = this.props;
      const session = sessions.find(s => s._id === sessionId);
      const sFiles = files.filter(f => f.meta.sessionId === sessionId);
      return <UploadPage {...session} files={sFiles} />;
    }
  };

  renderFeedback = ({match}) => {
    if (!match) {
      return <Loading key="loading" />;
    } else {
      const sessionId = match.params.id;
      const {sessions, files, comments} = this.props;
      const session = sessions.find(s => s._id === sessionId);
      const sComments = comments.filter(c => c.session === sessionId);
      const sFiles = files.filter(f => f.meta.sessionId === sessionId);
      return <FeedbackPage {...session} files={sFiles} comments={sComments} />;
    }
  };

  renderReview = ({match}) => {
    if (!match) {
      return <Loading key="loading" />;
    } else {
      const {sessions, files, reviewer, comments} = this.props;
      const sessionId = match.params.id;
      const session = sessions.find(s => s._id === sessionId);
      const sComments = comments.filter(c => c.session === sessionId);
      const sFiles = files.filter(f => f.meta.sessionId === sessionId);
      return (
        <ReviewContainer
          {...session}
          {...this.props}
          files={sFiles}
          reviewer={reviewer}
          comments={sComments}
          sessionId={sessionId}
        />
      );
    }
  };

  renderContent = ({location}) => {
    const {showConnectionIssue} = this.state;
    const {user, connected, reviewer, sessions, files, loading} = this.props;
    const guest = location.pathname.match(/share/);

    const shared = this.props;

    return (
      <div id="container">
        {showConnectionIssue && !connected ? <ConnectionNotification /> : null}
        {loading ? (
          <Loading key="loading" />
        ) : (
          <Switch location={location}>
            <Route path="/signin" component={AuthPageSignIn} {...shared} />
            <Route path="/join" component={AuthPageJoin} {...shared} />
            <Route path="/share/:id" render={this.renderReview} />

            <PrivateRoute
              exact
              path="/"
              user={user}
              render={() => <SessionListPage sessions={sessions} {...shared} />}
            />

            <PrivateRoute
              path="/sessions/:id"
              render={this.renderSession}
              user={user}
            />

            <PrivateRoute
              path="/slides/:id"
              render={this.renderUpload}
              user={user}
            />

            <PrivateRoute
              path="/feedback/:id"
              render={this.renderFeedback}
              user={user}
            />

            <PrivateRoute user={user} render={NotFoundPage} />
          </Switch>
        )}
      </div>
    );
  };

  render() {
    return (
      <BrowserRouter>
        <Route render={this.renderContent} />
      </BrowserRouter>
    );
  }
}

const PrivateRoute = ({user, render, ...other}) => {
  let loc = window.location.pathname;
  let out;
  if (user) {
    out = render;
  } else {
    out = () => (loc !== '/signin' ? <Redirect to="/signin" /> : null);
  }

  return <Route {...other} render={out} />;
};

App.propTypes = {
  user: PropTypes.object, // current meteor user
  connected: PropTypes.bool.isRequired, // server connection status
  loading: PropTypes.bool.isRequired, // subscription status
  sessions: PropTypes.array, // all visible files
  files: PropTypes.array, // all visible files
};

App.defaultProps = {
  user: null,
  sessions: [],
  files: [],
};
