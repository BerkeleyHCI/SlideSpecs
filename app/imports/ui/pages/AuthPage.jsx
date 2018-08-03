import React from 'react';
import PropTypes from 'prop-types';

// a common layout wrapper for auth pages
const AuthPage = ({content, link}) => (
  <div className="page auth">
    <div className="content-scrollable">
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
