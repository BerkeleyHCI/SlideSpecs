import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import BaseComponent from './BaseComponent.jsx';

export default class UserMenu extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = Object.assign(this.state, {open: false});
    this.toggle = this.toggle.bind(this);
  }

  toggle(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      open: !this.state.open,
    });
  }

  renderLoggedIn() {
    const {open} = this.state;
    const {user, logout} = this.props;
    const username = user.username;

    return (
      <div className="user-menu vertical">
        <a href="#toggle" className="btn-secondary" onClick={this.toggle}>
          {open ? (
            <span className="icon-arrow-up" />
          ) : (
            <span className="icon-arrow-down" />
          )}
          {username}
        </a>
        {open ? (
          <a className="btn-secondary" onClick={logout}>
            log out
          </a>
        ) : null}
      </div>
    );
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

  render() {
    return this.props.user ? this.renderLoggedIn() : this.renderLoggedOut();
  }
}

UserMenu.propTypes = {
  user: PropTypes.object,
  logout: PropTypes.func,
};
