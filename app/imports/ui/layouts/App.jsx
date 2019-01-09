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
import CommentPage from '../pages/CommentPage.jsx';
import DiscussPage from '../pages/DiscussPage.jsx';
import FeedbackPage from '../pages/FeedbackPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import ForbiddenPage from '../pages/ForbiddenPage.jsx';
import SharePage from '../pages/SharePage.jsx';

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
    const storedSession = Session.get('session');
    Session.set('talk', null);
    if (sid && (!storedSession || storedSession !== sid)) {
      Session.set('session', sid);
    }
    const {sessions, reviewer, talks, files, images, comments} = this.props;
    let props = sessions.find(s => s._id === sid) || {};
    props.files = files.filter(f => f.meta.sessionId === sid);
    props.images = images.filter(f => f.meta.sessionId === sid);
    props.talks = talks.filter(f => f.session === sid);
    props.reviewer = reviewer;
    props.sessionId = sid;
    return props;
  };

  getTalkProps = tid => {
    const storedTalk = Session.get('talk');
    const {sessions, talks, reviewer, files, images, comments} = this.props;
    if (tid && (!storedTalk || storedTalk !== tid)) {
      Session.set('talk', tid);
    }
    const talk = talks.find(t => t._id === tid) || {};
    console.log(talks, tid, talk);
    Session.set('session', talk.session);

    let props = {};
    props.talk = talk;
    props.sessionId = talk.session;
    props.session = sessions.find(s => s._id === talk.sessionId);
    props.files = files.filter(f => f.meta.talkId === tid);
    props.images = images.filter(f => f.meta.talkId === tid);
    props.sComments = comments.filter(c => c.talk === tid);
    props.comments = props.sComments.filter(this.controlFilter);
    props.reviewer = reviewer;
    props.talkId = tid;
    return props;
  };

  preRender = (match, Comp, pType) => {
    if (!match) {
      return <Loading />;
    } else {
      const shared = this.getSharedProps();
      let sProps = {};
      if (pType == 'session') {
        sProps = this.getSessionProps(match.params.id);
        return <Comp {...shared} {...sProps} />;
      }
      let tProps = {};
      if (pType == 'talk') {
        tProps = this.getTalkProps(match.params.id);
        return <ReviewContainer Comp={Comp} {...shared} {...tProps} />;
      }
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

  renderShare = ({match}) => {
    return this.preRender(match, SharePage, 'session');
  };

  renderComment = ({match}) => {
    return this.preRender(match, CommentPage, 'talk');
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
    const {user, sessions, files, loading} = this.props;
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
            <Route path="/share/:id" render={this.renderShare} />
            <Route path="/comment/:id" render={this.renderComment} />

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

  // TODO - handle using the session / talk variables to recover routes.

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
  talks: PropTypes.array,
  files: PropTypes.array, // all visible files
};

App.defaultProps = {
  user: null,
  sessions: [],
  talks: [],
  files: [],
};
