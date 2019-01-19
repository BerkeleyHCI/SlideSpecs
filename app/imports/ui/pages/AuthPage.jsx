import React from 'react';
import PropTypes from 'prop-types';
import MenuContainer from '../containers/MenuContainer.jsx';
import BaseComponent from '../components/BaseComponent.jsx';

// a common layout wrapper for auth pages

class AuthPage extends BaseComponent {
  renderAuthPage = () => {
    const {content, link} = this.props;
    return (
      <div className="page auth main-content">
        <div className="main-content">
          {content}
          <h2>{link}</h2>
        </div>
      </div>
    );
  };

  render = () => {
    const content = this.renderAuthPage();
    return <MenuContainer {...this.props} content={content} />;
  };
}

AuthPage.propTypes = {
  content: PropTypes.element.isRequired,
  link: PropTypes.element.isRequired,
};

export default AuthPage;
