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
          {link}
        </div>
      </div>
    );
  };

  render = () => {
    return <MenuContainer {...this.props} content={this.renderAuthPage()} />;
  };
}

AuthPage.propTypes = {
  content: PropTypes.element.isRequired,
  link: PropTypes.element.isRequired,
};

export default AuthPage;
