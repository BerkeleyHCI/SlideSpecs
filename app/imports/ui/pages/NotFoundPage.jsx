import React from 'react';
import PropTypes from 'prop-types';
import BaseComponent from '../components/BaseComponent.jsx';
import Message from '../components/Message.jsx';

class NotFoundPage extends BaseComponent {
  render() {
    return (
      <div className="page not-found">
        <div className="main-content">
          <Message title="page not found" />
        </div>
      </div>
    );
  }
}

export default NotFoundPage;
