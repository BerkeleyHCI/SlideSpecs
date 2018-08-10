import React from 'react';
import UserMenu from '../components/UserMenu.jsx';
import PropTypes from 'prop-types';

// a common layout wrapper for auth pages
const AuthPage = ({content, link}) => (
  <div className="page auth main-content">
    {content}
    {link}
  </div>
);

AuthPage.propTypes = {
  content: PropTypes.element.isRequired,
  link: PropTypes.element.isRequired,
};

export default AuthPage;
