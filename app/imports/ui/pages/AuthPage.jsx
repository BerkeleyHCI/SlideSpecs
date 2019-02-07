import React from 'react';
import PropTypes from 'prop-types';
import MenuContainer from '../containers/MenuContainer.jsx';
import BaseComponent from '../components/BaseComponent.jsx';
import {Message} from '../components/Message.jsx';
import Loading from '../components/Loading.jsx';

// a common layout wrapper for auth pages

class AuthPage extends BaseComponent {
  renderAuthPage = () => {
    const {content, link} = this.props;
    const loggingIn = Meteor.loggingIn();
    const loggingOut = Meteor.loggingOut();
    return (
      <div className="page auth main-content">
        <div className="main-content">
          {loggingIn && <Message title="logging in..." />}
          {loggingOut && <Message title="logging out..." />}
          {!loggingIn && !loggingOut && (
            <div>
              {content}
              <h2>{link}</h2>
            </div>
          )}
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
