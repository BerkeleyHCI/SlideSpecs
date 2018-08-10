import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import BaseComponent from './BaseComponent.jsx';
import {Session} from 'meteor/session.js';

export default class UserMenu extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = Object.assign(this.state, {open: false});
  }

  unsetName = () => {
    localStorage.removeItem('feedbacks.reviewer');
    Session.set('reviewer', undefined);
  };

  goHome = e => {
    e.preventDefault();
    this.redirectTo('/');
  };

  toggle = e => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      open: !this.state.open,
    });
  };

  renderOpen = () => {
    const {user, logout} = this.props;
    const username = user.username;
    return (
      <div className="user-menu vertical">
        <a href="#toggle" className="btn-secondary" onClick={this.toggle}>
          {username}
          <span className="icon-arrow-up" />
        </a>
        <a className="btn-secondary" onClick={this.goHome}>
          sessions
        </a>
        <a className="btn-secondary" onClick={logout}>
          log out
        </a>
      </div>
    );
  };

  renderClosed() {
    const {user, logout} = this.props;
    const username = user.username;
    return (
      <div className="user-menu vertical">
        <a href="#toggle" className="btn-secondary" onClick={this.toggle}>
          {username}
          <span className="icon-arrow-down" />
        </a>
      </div>
    );
  }

  renderLoggedIn() {
    if (this.state.open) {
      return this.renderOpen();
    } else {
      return this.renderClosed();
    }
  }

  renderLoggedOut() {
    return (
      <div className="user-menu">
        <Link to="/signin" className="btn-secondary">
          sign in
        </Link>
        <Link to="/join" className="btn-secondary">
          join
        </Link>
      </div>
    );
  }

  renderGuest = () => {
    const {reviewer} = this.props;
    if (reviewer) {
      return (
        <div className="user-menu vertical">
          <a className="btn-secondary" onClick={this.toggle}>
            {reviewer}
          </a>
          <a className="btn-secondary" onClick={this.unsetName}>
            clear name
          </a>
        </div>
      );
    }
  };

  render() {
    const {user, guest, reviewer} = this.props;
    let content = user ? this.renderLoggedIn() : this.renderLoggedOut();
    if (guest) content = this.renderGuest();
    return (
      this.renderRedirect() || (
        <section id="menu">
          <h1>
            {guest ? <span>feedback</span> : <Link to="/">feedback</Link>}
          </h1>
          {content}
        </section>
      )
    );
  }
}

UserMenu.propTypes = {
  user: PropTypes.object,
  logout: PropTypes.func,
};
