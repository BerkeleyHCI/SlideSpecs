import React, {Component} from 'react';
import {BrowserRouter, Switch, Route, Link, Redirect} from 'react-router-dom';
import PropTypes from 'prop-types';
import {TransitionGroup, CSSTransition} from 'react-transition-group';
import {Meteor} from 'meteor/meteor';
import {Lists} from '../../api/lists/lists.js';
import {Files} from '../../api/files/files.js';
import UserMenu from '../components/UserMenu.jsx';
import ListList from '../components/ListList.jsx';
import ConnectionNotification from '../components/ConnectionNotification.jsx';
import Loading from '../components/Loading.jsx';
import FileUploader from '../components/FileUploader.jsx';
import SessionsList from '../components/SessionsList.jsx';
import ListPageContainer from '../containers/ListPageContainer.jsx';
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

  renderContent(location) {
    console.log(location);
    const {user, connected, lists, files, loading} = this.props;
    const {showConnectionIssue} = this.state;
    return (
      <div id="container">
        <section id="menu">
          <h1>
            <Link to="/">feedback</Link>
          </h1>
          <UserMenu user={user} logout={this.logout} />
          {user && (
          <div>
            <ListList lists={lists} />
            <Link to="/upload"> slides </Link>
          </div>
          )}
        </section>
        {showConnectionIssue && !connected ? <ConnectionNotification /> : null}
        <div id="content-container">
          {loading ? (
          <Loading key="loading" />
          ) : (
          <TransitionGroup>
            <CSSTransition key={location.key} classNames="fade" timeout={100}>
              <Switch location={location}>
                <Route path="/signin" component={AuthPageSignIn} />
                <Route path="/join" component={AuthPageJoin} />

                <PrivateRoute
                  exact path="/" user={user}
                  render={() => <SessionsList/>}
                />

                <PrivateRoute
                  path="/upload" user={user}
                  render={() => <FileUploader  files={files} />}
                />

                <Route
                  path="/lists/:id" user={user}
                  render={({match}) => <ListPageContainer match={match} />}
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
        <Route render={({location}) => this.renderContent(location) } />
      </BrowserRouter>
      );
  }
}

const PrivateRoute = ({ user, render, ...other }) => (
  <Route {...other} render={() => user ? render() : (<Redirect to="/signin" />) } />
);

App.propTypes = {
  user: PropTypes.object, // current meteor user
  connected: PropTypes.bool.isRequired, // server connection status
  loading: PropTypes.bool.isRequired, // subscription status
  lists: PropTypes.array, // all lists visible to the current user
  files: PropTypes.array, // all visible files
};

App.defaultProps = {
  user: null,
  lists: [],
  files: [],
}

