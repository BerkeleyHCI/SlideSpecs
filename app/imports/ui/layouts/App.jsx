import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Meteor} from 'meteor/meteor';
import {ToastContainer, toast, cssTransition} from 'react-toastify';
import {BrowserRouter, Switch, Route, Redirect} from 'react-router-dom';

import {Sessions} from '../../api/sessions/sessions.js';
import {Talks} from '../../api/talks/talks.js';
import AppModal from '../components/AppModal.jsx';
import Loading from '../components/Loading.jsx';
import AppNotification from '../components/AppNotification.jsx';
import BaseComponent from '../components/BaseComponent.jsx';
import ReviewContainer from '../containers/ReviewContainer.jsx';

import AuthPageSignIn from '../pages/AuthPageSignIn.jsx';
import AuthPageJoin from '../pages/AuthPageJoin.jsx';
import SessionListPage from '../pages/SessionListPage.jsx';
import SessionPage from '../pages/SessionPage.jsx';
import TalkPage from '../pages/TalkPage.jsx';
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
    const {sessions, talks, files, images, comments} = this.props;
    let session = sessions.find(s => s._id === sid) || {};
    session.files = files.filter(f => f.meta.sessionId === sid);
    session.images = images.filter(f => f.meta.sessionId === sid);
    session.talks = talks.filter(f => f.session === sid);
    session.sessionId = sid;
    return session;
  };

  getTalkProps = tid => {
    if ((tid && !Session.get('talk')) || Session.get('talk') !== tid) {
      Session.set('talk', tid);
    }
    const {talks, files, images, comments, events, reviewer} = this.props;
    let talk = talks.find(t => t._id === tid) || {};
    talk.files = files.filter(f => f.meta.talkId === tid);
    talk.images = images.filter(f => f.meta.talkId === tid);
    talk.sComments = comments.filter(c => c.talk === tid);
    talk.comments = talk.sComments.filter(this.controlFilter);
    talk.events = events.filter(e => e.talk === tid);
    talk.active = talk.events[0];
    talk.reviewer = reviewer;
    talk.talkId = tid;
    return talk;
  };

  preRender = (match, Comp, pType) => {
    if (!match) {
      return <Loading />;
    } else {
      const shared = this.getSharedProps();
      let sProps = {};
      if (pType == 'session') {
        sProps = this.getSessionProps(match.params.id);
      }
      let tProps = {};
      if (pType == 'talk') {
        tProps = this.getTalkProps(match.params.id);
      }
      return <Comp {...shared} {...sProps} {...tProps} />;
    }
  };

  renderSession = ({match}) => {
    return this.preRender(match, SessionPage, 'session');
  };

  renderTalk = ({match}) => {
    return this.preRender(match, TalkPage, 'talk');
  };

  renderDiscuss = ({match}) => {
    return this.preRender(match, DiscussPage, 'talk');
  };

  renderFeedback = ({match}) => {
    return this.preRender(match, FeedbackPage, 'talk');
  };

  renderReview = ({match}) => {
    return this.preRender(match, ReviewContainer, 'talk');
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
              render={this.renderTalk}
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
  const matchId = other.computedMatch.params.id;
  const sess = Sessions.findOne(matchId);
  const talk = Talks.findOne(matchId);
  let loc = window.location.pathname;
  let out;

  if (!user) {
    out = () => (loc !== '/signin' ? <Redirect to="/signin" /> : null);
  } else if (matchId && !sess && !talk) {
    out = () => <NotFoundPage />;
  } else if (
    (sess && sess.userId !== Meteor.userId()) ||
    (talk && talk.userId !== Meteor.userId())
  ) {
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
