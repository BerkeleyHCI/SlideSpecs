import React from 'react';
import PropTypes from 'prop-types';
import {Session} from 'meteor/session';
import {Link} from 'react-router-dom';

import Message from '../components/Message.jsx';
import BaseComponent from '../components/BaseComponent.jsx';
import SlideReviewPage from '../pages/SlideReviewPage.jsx';

export default class ReviewContainer extends BaseComponent {
  getText = () => {
    var copyText = document.getElementsByClassName('code')[0];
    if (copyText) {
      return copyText.value;
    } else {
      return '';
    }
  };

  setName = () => {
    const name = this.getText();
    Session.set('name', name);
  };

  renderName = () => {
    return (
      <div className="alert">
        <h3>name entry</h3>
        please enter your name before providing feedback:
        <hr />
        <input
          type="text"
          defaultValue="your name"
          className="code"
          onSubmit={this.setName}
        />
        <hr />
        <div className="btns-group">
          <button onClick={this.setName} className="btn btn-menu">
            set name
          </button>
        </div>
      </div>
    );
  };

  render() {
    const {reviewer} = this.props;
    return (
      <div className="main-content">
        {reviewer ? <SlideReviewPage {...this.props} /> : this.renderName()}
      </div>
    );
  }
}

ReviewContainer.propTypes = {
  _id: PropTypes.string, // current session
  files: PropTypes.array, // current session files
  reviewer: PropTypes.string, // current session files
};

ReviewContainer.defaultProps = {
  files: [],
};
