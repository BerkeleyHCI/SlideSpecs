import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Meteor} from 'meteor/meteor';
import {Sessions} from '../../api/sessions/sessions.js';
import {ToastContainer, toast, cssTransition} from 'react-toastify';
import {BrowserRouter, Switch, Route, Redirect} from 'react-router-dom';
import AppModal from '../components/AppModal.jsx';

import Loading from '../components/Loading.jsx';
import AppNotification from '../components/AppNotification.jsx';
import BaseComponent from '../components/BaseComponent.jsx';
import ReviewContainer from '../containers/ReviewContainer.jsx';

import AuthPageSignIn from '../pages/AuthPageSignIn.jsx';
import AuthPageJoin from '../pages/AuthPageJoin.jsx';
import SessionPage from '../pages/SessionPage.jsx';
import SessionListPage from '../pages/SessionListPage.jsx';
import DiscussPage from '../pages/DiscussPage.jsx';
import FeedbackPage from '../pages/FeedbackPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import UploadPage from '../pages/UploadPage.jsx';
import ConvertPage from '../pages/ConvertPage.jsx';
import StudyPage from '../pages/StudyPage.jsx';

const CONNECTION_ISSUE_TIMEOUT = 5000;

const Fade = cssTransition({
  enter: 'fadeIn',
  exit: 'fadeOut',
  duration: [200, 0],
});

export default class App extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {showConnectionIssue: false, modal: {isOpen: false}};
  }

  componentDidMount() {
    setTimeout(() => {
      /* eslint-disable react/no-did-mount-set-state */
      this.setState({showConnectionIssue: true});
    }, CONNECTION_ISSUE_TIMEOUT);
  }

  getSharedProps = () => {
    return {
      ...this.props,
      clearModal: this.clearModal,
      setModal: this.setModal,
    };
  };

  setModal = m => {
    this.setState({modal: m});
  };

  clearModal = () => {
    this.setState({modal: {isOpen: false}});
  };

  controlFilter = comment => {
    const auth = ['system', this.props.reviewer];
    return (
      !comment.userOwn || (comment.userOwn && auth.includes(comment.author))
    );
  };

  getSessionProps = sid => {
    if ((sid && !Session.get('session')) || Session.get('session') !== sid) {
      Session.set('session', sid);
    }
    const {
      sessions,
      talks,
      files,
      images,
      comments,
      events,
      reviewer,
    } = this.props;
    let session = sessions.find(s => s._id === sid) || {};
    session.files = files.filter(f => f.meta.sessionId === sid);
    session.images = images.filter(f => f.meta.sessionId === sid);
    session.talks = talks.filter(f => f.session === sid);
    session.sComments = comments.filter(c => c.session === sid);
    session.comments = session.sComments.filter(this.controlFilter);
    session.events = events.filter(e => e.session === sid);
    session.active = session.events[0];
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
    return this.preRender(match, SessionPage);
  };

  renderUpload = ({match}) => {
    return this.preRender(match, UploadPage);
  };

  renderDiscuss = ({match}) => {
    return this.preRender(match, DiscussPage);
  };

  renderFeedback = ({match}) => {
    return this.preRender(match, FeedbackPage);
  };

  renderReview = ({match}) => {
    return this.preRender(match, ReviewContainer);
  };

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
    const shared = this.getSharedProps();
    const {modal} = this.state;
    this.showConnection();

    return (
      <div id="container">
        <AppModal {...modal} />
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
            <Route path="/join" component={AuthPageJoin} {...shared} />
            <Route path="/signin" component={AuthPageSignIn} {...shared} />
            <Route path="/share/:id" render={this.renderReview} />
            <Route path="/convert" component={ConvertPage} />
            <Route path="/ar-vr" component={StudyPage} />

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

            <Route
              path="/discuss/:id"
              render={this.renderDiscuss}
              user={user}
            />

            <PrivateRoute
              path="/feedback/:id"
              render={this.renderFeedback}
              user={user}
            />

            <PrivateRoute user={user} render={() => <NotFoundPage />} />
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
          msg="connection issue"
          desc="trying to reconnect..."
          icon="refresh"
        />
      ));
    }
  };
}

const PrivateRoute = ({user, render, ...other}) => {
  const sessionId = other.computedMatch.params.id;
  const sess = Sessions.findOne(sessionId);
  let loc = window.location.pathname;
  let out;

  if (!user) {
    out = () => (loc !== '/signin' ? <Redirect to="/signin" /> : null);
  } else if (sessionId && sess == undefined) {
    out = () => <NotFoundPage />;
  } else if (sessionId && sess.userId != Meteor.userId()) {
    out = () => <ForbiddenPage />;
  } else {
    out = render;
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
