import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {Accounts} from 'meteor/accounts-base';
import BaseComponent from '../components/BaseComponent.jsx';

import AuthPage from './AuthPage.jsx';

class JoinPage extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = Object.assign(this.state, {errors: {}});
    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit(event) {
    event.preventDefault();
    const email = this.email.value;
    const password = this.password.value;
    const confirm = this.confirm.value;
    const errors = {};

    if (!email) {
      errors.email = 'emailRequired';
    }
    if (!password) {
      errors.password = 'passwordRequired';
    }
    if (confirm !== password) {
      errors.confirm = 'passwordConfirm';
    }

    this.setState({errors});
    if (Object.keys(errors).length) {
      return;
    }

    Accounts.createUser(
      {
        email,
        password,
      },
      err => {
        if (err) {
          this.setState({
            errors: {none: err.reason},
          });
        }
        this.redirectTo('/');
      },
    );
  }

  render() {
    const {errors} = this.state;
    const errorMessages = Object.keys(errors).map(key => errors[key]);
    const errorClass = key => errors[key] && 'error';

    const content = (
      <div className="wrapper-auth">
        <h1 className="title-auth">join</h1>
        <h3 className="subtitle-auth">.</h3>
        <form onSubmit={this.onSubmit}>
          <div className="list-errors">
            {errorMessages.map(msg => (
              <div className="list-item" key={msg}>
                {msg}
              </div>
            ))}
          </div>
          <div className={`input-symbol ${errorClass('email')}`}>
            <input
              type="email"
              name="email"
              ref={c => {
                this.email = c;
              }}
              placeholder="your Email"
            />
            <span className="icon-email" title="your email" />
          </div>
          <div className={`input-symbol ${errorClass('password')}`}>
            <input
              type="password"
              name="password"
              ref={c => {
                this.password = c;
              }}
              placeholder="password"
            />
            <span className="icon-lock" title="password" />
          </div>
          <div className={`input-symbol ${errorClass('confirm')}`}>
            <input
              type="password"
              name="confirm"
              ref={c => {
                this.confirm = c;
              }}
              placeholder="confirm Password"
            />
            <span className="icon-lock" title="confirm Password" />
          </div>
          <button type="submit" className="btn-primary">
            join now
          </button>
        </form>
      </div>
    );

    const link = (
      <Link to="/signin" className="link-auth-alt">
        sign in
      </Link>
    );

    return (
      this.renderRedirect() || (
        <AuthPage
          content={content}
          link={link}
          menuOpen={this.props.menuOpen}
        />
      )
    );
  }
}

JoinPage.propTypes = {
  menuOpen: PropTypes.object.isRequired,
};

export default JoinPage;
