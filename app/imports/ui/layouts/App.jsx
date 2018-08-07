import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Meteor} from 'meteor/meteor';
import {BrowserRouter, Switch, Route, Link, Redirect} from 'react-router-dom';
import {TransitionGroup, CSSTransition} from 'react-transition-group';

import UserMenu from '../components/UserMenu.jsx';
import Loading from '../components/Loading.jsx';
import ConnectionNotification from '../components/ConnectionNotification.jsx';
import SessionContainer from '../containers/SessionContainer.jsx';
import ReviewContainer from '../containers/ReviewContainer.jsx';

import AuthPageSignIn from '../pages/AuthPageSignIn.jsx';
import AuthPageJoin from '../pages/AuthPageJoin.jsx';
import SessionListPage from '../pages/SessionListPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import UploadPage from '../pages/UploadPage.jsx';

const CONNECTION_ISSUE_TIMEOUT = 5000;

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showConnectionIssue: false,
      redirectTo: null,
    };
    this.logout = this.logout.bind(this);
  }

  componentDidMount() {
    setTimeout(() => {
      /* eslint-disable react/no-did-mount-set-state */
      this.setState({showConnectionIssue: true});
    }, CONNECTION_ISSUE_TIMEOUT);
  }

  logout() {
    Meteor.logout();
  }

  renderSession = ({match}) => {
    if (!match) {
      return <Loading key="loading" />;
    } else {
      const {sessions, files} = this.props;
      const sessionId = match.params.id;
      const session = sessions.find(s => s._id === sessionId);
      const sFiles = files.filter(f => f.meta.sessionId === sessionId);
      return <SessionContainer {...session} files={sFiles} />;
    }
  };

  renderUpload = ({match}) => {
    if (!match) {
      return <Loading key="loading" />;
    } else {
      const {sessions, files} = this.props;
      const sessionId = match.params.id;
      const session = sessions.find(s => s._id === sessionId);
      const sFiles = files.filter(f => f.meta.sessionId === sessionId);
      return <UploadPage {...session} files={sFiles} />;
    }
  };

  renderReview = ({match}) => {
    if (!match) {
      return <Loading key="loading" />;
    } else {
      const {sessions, files, reviewer, comments} = this.props;
      const sessionId = match.params.id;
      const session = sessions.find(s => s._id === sessionId);
      const sFiles = files.filter(f => f.meta.sessionId === sessionId);
      return (
        <ReviewContainer
          {...session}
          files={sFiles}
          reviewer={reviewer}
          comments={comments}
          sessionId={sessionId}
        />
      );
    }
  };

  renderContent(location) {
    const {user, connected, reviewer, sessions, files, loading} = this.props;
    const {showConnectionIssue} = this.state;
    const guest = location.pathname.match(/share/);
    return (
      <div id="container">
        <UserMenu
          user={user}
          guest={guest}
          reviewer={reviewer}
          logout={this.logout}
        />
        {showConnectionIssue && !connected ? <ConnectionNotification /> : null}
        <div id="content-container">
          {loading ? (
            <Loading key="loading" />
          ) : (
            <TransitionGroup>
              <CSSTransition key={location.key} classNames="fade" timeout={300}>
                <Switch location={location}>
                  <Route path="/signin" component={AuthPageSignIn} />
                  <Route path="/join" component={AuthPageJoin} />
                  <Route path="/share/:id" render={this.renderReview} />

                  <PrivateRoute
                    exact
                    path="/"
                    user={user}
                    render={() => <SessionListPage sessions={sessions} />}
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

                  <Route path="/*" component={NotFoundPage} />
                </Switch>
              </CSSTransition>
            </TransitionGroup>
          )}
        </div>
      </div>
    );
  }

  render() {
    return (
      <BrowserRouter>
        <Route render={({location}) => this.renderContent(location)} />
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
