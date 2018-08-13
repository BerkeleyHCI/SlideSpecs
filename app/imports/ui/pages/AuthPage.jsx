import React from 'react';
import UserMenu from '../components/UserMenu.jsx';
import Loading from '../components/Loading.jsx';
import PropTypes from 'prop-types';

// a common layout wrapper for auth pages
//{Meteor.loggingIn() && <Loading key="signing in" />}

const AuthPage = ({content, link}) => (
  <div className="page auth main-content">
    <div className="main-content">
      {content}
      {link}
    </div>
  </div>
);

AuthPage.propTypes = {
  content: PropTypes.element.isRequired,
  link: PropTypes.element.isRequired,
};

export default AuthPage;
