import React from 'react';
import {Meteor} from 'meteor/meteor';
import PropTypes from 'prop-types';
import {ToastContainer, toast, cssTransition} from 'react-toastify';
import {BrowserRouter, Switch, Route, Redirect} from 'react-router-dom';

import AppModal from '../components/AppModal.jsx';
import Loading from '../components/Loading.jsx';
import AppNotification from '../components/AppNotification.jsx';
import BaseComponent from '../components/BaseComponent.jsx';
import UserContainer from '../containers/UserContainer.jsx';
import SessionContainer from '../containers/SessionContainer.jsx';
import TalkContainer from '../containers/TalkContainer.jsx';

import AuthPageSignIn from '../pages/AuthPageSignIn.jsx';
import AuthPageJoin from '../pages/AuthPageJoin.jsx';
import SessionListPage from '../pages/SessionListPage.jsx';
  import SessionPage from '../pages/SessionPage.jsx';
import TalkPage from '../pages/TalkPage.jsx';
import SharePage from '../pages/SharePage.jsx';
import CommentPage from '../pages/CommentPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import ForbiddenPage from '../pages/ForbiddenPage.jsx';

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

  preRender = (match, Comp, pType) => {
    const shared = this.getSharedProps();
    if (pType == 'user') {
      return <UserContainer Comp={Comp} {...shared} id={Meteor.userId()} />;
    } else if (pType == 'session') {
      return <SessionContainer Comp={Comp} {...shared} id={match.params.id} />;
    } else if (pType == 'talk') {
      return <TalkContainer Comp={Comp} {...shared} id={match.params.id} />;
    } else {
      return <NotFoundPage />;
    }
  };

  renderSessionList = ({match}) => {
    return this.preRender(match, SessionListPage, 'user');
  };

  renderSession = ({match}) => {
    return this.preRender(match, SessionPage, 'session');
  };

  renderTalk = ({match}) => {
    return this.preRender(match, TalkPage, 'talk');
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
              render={this.renderSessionList}
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

            <PrivateRoute user={user} render={() => <NotFoundPage />} />
          </Switch>
        )}
      </div>
    );
  };

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

  render() {
    return (
      <BrowserRouter>
        <Route render={this.renderContent} />
      </BrowserRouter>
    );
  }
}

const PrivateRoute = ({user, render, ...other}) => {
  const matchId = other.computedMatch.params.id;
  // TODO - look up and see if session/talk exists
  let out,
    loc = window.location.pathname;

  if (!user) {
    out = () => (loc !== '/signin' ? <Redirect to="/signin" /> : null);
  } else {
    out = render;
  }

  return <Route {...other} render={out} />;
};

App.propTypes = {
  connected: PropTypes.bool.isRequired, // server connection status
  loading: PropTypes.bool.isRequired, // subscription status
  user: PropTypes.object, // current meteor user
  sessions: PropTypes.array,
  talks: PropTypes.array,
  comments: PropTypes.array,
  files: PropTypes.array,
  images: PropTypes.array,
};

App.defaultProps = {
  user: null,
  sessions: [],
  talks: [],
  comments: [],
  files: [],
  images: [],
};
