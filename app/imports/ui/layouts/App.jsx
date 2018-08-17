import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Meteor} from 'meteor/meteor';
import {ToastContainer, toast, cssTransition} from 'react-toastify';
import {BrowserRouter, Switch, Route, Link, Redirect} from 'react-router-dom';

import Loading from '../components/Loading.jsx';
import AppNotification from '../components/AppNotification.jsx';
import BaseComponent from '../components/BaseComponent.jsx';
import SessionContainer from '../containers/SessionContainer.jsx';
import ReviewContainer from '../containers/ReviewContainer.jsx';

import AuthPageSignIn from '../pages/AuthPageSignIn.jsx';
import AuthPageJoin from '../pages/AuthPageJoin.jsx';
import SessionListPage from '../pages/SessionListPage.jsx';
import FeedbackPage from '../pages/FeedbackPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import UploadPage from '../pages/UploadPage.jsx';

const CONNECTION_ISSUE_TIMEOUT = 5000;

const Fade = cssTransition({
  enter: 'fadeIn',
  exit: 'fadeOut',
  duration: [200, 0],
});

export default class App extends BaseComponent {
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

  getSharedProps = () => {
    return this.props;
  };

  getSessionProps = sid => {
    const {sessions, files, comments, reviewer} = this.props;
    let session = sessions.find(s => s._id === sid) || {};
    session.files = files.filter(f => f.meta.sessionId === sid);
    session.comments = comments.filter(c => c.session === sid);
    session.reviewer = reviewer;
    session.sessionId = sid;
    return session;
  };

  preRender = (match, Comp) => {
    if (!match) {
      return <Loading key="loading" />;
    } else {
      const shared = this.getSharedProps();
      const sProps = this.getSessionProps(match.params.id);
      return <Comp {...shared} {...sProps} />;
    }
  };

  renderSession = ({match}) => {
    return this.preRender(match, SessionContainer);
  };

  renderUpload = ({match}) => {
    return this.preRender(match, UploadPage);
  };

  renderFeedback = ({match}) => {
    return this.preRender(match, FeedbackPage);
  };

  renderReview = ({match}) => {
    return this.preRender(match, ReviewContainer);
  };

  // TODO - NEED TO TEST ON BAYSCOPE.

  renderSecure = () => {
    if (location.protocol === 'http:' && location.hostname !== 'localhost') {
      console.log('moving to https...');
      const secure = 'https:' + window.location.href.substring(5);
      window.location.replace(secure);
    }
  };

  renderContent = ({location}) => {
    this.renderSecure(); // http -> https
    const {user, reviewer, sessions, files, loading} = this.props;
    const guest = location.pathname.match(/share/);
    const shared = this.getSharedProps();
    this.showConnection();

    return (
      <div id="container">
        <ToastContainer
          type="info"
          transition={Fade}
          closeButton={false}
          hideProgressBar={true}
          toastClassName="dark-toast"
          position="top-right"
          autoClose={2000}
          pauseOnHover={false}
        />
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

  showConnection = () => {
    const {showConnectionIssue} = this.state;
    const {connected} = this.props;
    if (showConnectionIssue && !connected) {
      toast(() => (
        <AppNotification
          icon="sync"
          msg="connection issue"
          desc="trying to reconnect..."
        />
      ));
    }
  };
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
