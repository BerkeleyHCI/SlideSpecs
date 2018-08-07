import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Meteor} from 'meteor/meteor';
import {BrowserRouter, Switch, Route, Link, Redirect} from 'react-router-dom';
import {TransitionGroup, CSSTransition} from 'react-transition-group';

import UserMenu from '../components/UserMenu.jsx';
import Loading from '../components/Loading.jsx';
import FileUploader from '../components/FileUploader.jsx';
import ConnectionNotification from '../components/ConnectionNotification.jsx';
import SessionContainer from '../containers/SessionContainer.jsx';

import SessionListPage from '../pages/SessionListPage.jsx';
import AuthPageSignIn from '../pages/AuthPageSignIn.jsx';
import AuthPageJoin from '../pages/AuthPageJoin.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';

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
    console.log(match);
    return (
      <SessionContainer
        name={name}
        files={files}
        match={match}
        session={sessions}
      />
    );
  };

  renderContent(location) {
    const {user, connected, sessions, files, loading} = this.props;
    const {showConnectionIssue} = this.state;
    return (
      <div id="container">
        <section id="menu">
          <h1>
            <Link to="/">feedback</Link>
          </h1>
          <UserMenu user={user} logout={this.logout} />
        </section>
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

                  <PrivateRoute
                    exact
                    path="/"
                    user={user}
                    render={() => <SessionListPage sessions={sessions} />}
                  />

                  <PrivateRoute
                    path="/sessions/:id"
                    user={user}
                    render={this.renderSession}
                  />

                  <PrivateRoute
                    path="/upload/:id"
                    user={user}
                    render={({match}) => (
                      <FileUploader files={files} match={match} />
                    )}
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
