import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import BaseComponent from './BaseComponent.jsx';
import {Session} from 'meteor/session.js';

export default class UserMenu extends BaseComponent {
  unsetName = () => {
    localStorage.removeItem('feedbacks.reviewer');
    Session.set('reviewer', undefined);
  };

  goHome = e => {
    e.preventDefault();
    this.redirectTo('/');
  };

  logout = e => {
    e.preventDefault();
    Meteor.logout();
  };

  toggle = e => {
    e.preventDefault();
    e.stopPropagation();
  };

  renderOpen = () => {
    const {user} = this.props;
    const username = user.username;
    return (
      <div className="user-menu vertical">
        <a className="btn-secondary" onClick={this.goHome}>
          {username}
        </a>
        <a className="btn-secondary" onClick={this.logout}>
          log out
        </a>
      </div>
    );
  };

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
    let content = user ? this.renderOpen() : this.renderLoggedOut();
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
};
