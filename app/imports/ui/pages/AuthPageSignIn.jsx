import {Meteor} from 'meteor/meteor';
import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

import BaseComponent from '../components/BaseComponent.jsx';
import AuthPage from './AuthPage.jsx';

class SignInPage extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {errors: {}};
  }

  redirectHomeIfUser = () => {
    const saved = localStorage.getItem('feedbacks.referringLink');
    const home = saved || '/';
    if (saved) {
      localStorage.setItem('feedbacks.referringLink', ''); // empty
    }

    if (Meteor.user() && !Meteor.loggingIn()) {
      this.redirectTo(home);
    }
  };

  componentDidMount = this.redirectHomeIfUser;
  componentDidUpdate = this.redirectHomeIfUser;

  onSubmit = event => {
    event.preventDefault();
    const username = this.username.value;
    const password = this.password.value;
    const errors = {};

    if (!username) {
      errors.username = 'username required';
    }
    if (!password) {
      errors.password = 'password required';
    }

    this.setState({errors});
    if (Object.keys(errors).length) {
      return;
    }

    Meteor.loginWithPassword(username, password, err => {
      if (err) {
        this.setState({errors: {none: err.reason}});
      }
    });
  };

  render() {
    const {errors} = this.state;
    const errorMessages = Object.keys(errors).map(key => errors[key]);
    const errorClass = key => errors[key] && 'error';

    const content = (
      <div className="wrapper-auth">
        <h1 className="title-auth">sign in</h1>
        <form onSubmit={this.onSubmit}>
          <div className="list-errors">
            {errorMessages.map(msg => (
              <div className="list-item" key={msg}>
                {msg}
              </div>
            ))}
          </div>
          <div className={`input-symbol ${errorClass('username')}`}>
            <i className="fa fa-inline fa-user" title="username" />
            <input
              type="username"
              name="username"
              ref={c => {
                this.username = c;
              }}
              placeholder="username"
            />
          </div>
          <div className={`input-symbol ${errorClass('password')}`}>
            <i className="fa fa-inline fa-key" title="password" />
            <input
              type="password"
              name="password"
              ref={c => {
                this.password = c;
              }}
              placeholder="password"
            />
          </div>
          <button type="submit" className="btn-primary">
            sign in
          </button>
        </form>
      </div>
    );

    const link = (
      <Link to="/join" className="link-auth-alt">
        join
      </Link>
    );

    return (
      this.renderRedirect() || (
        <AuthPage {...this.props} content={content} link={link} />
      )
    );
  }
}

export default SignInPage;
