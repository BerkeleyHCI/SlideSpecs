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
          placeholder="enter your name here"
          className="code"
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
    let content;
    const {files, reviewer} = this.props;
    if (!files || files.length <= 0) {
      content = (
        <Message title="no slides here yet" subtitle="wait for presenter" />
      );
    } else {
      content = reviewer ? (
        <SlideReviewPage {...this.props} />
      ) : (
        this.renderName()
      );
    }
    return (
      this.renderRedirect() || <div className="main-content">{content}</div>
    );
  }
}

ReviewContainer.propTypes = {
  _id: PropTypes.string, // current session
  files: PropTypes.array, // session files
  reviewer: PropTypes.string,
  session: PropTypes.object,
};

ReviewContainer.defaultProps = {
  session: {},
  files: [],
};
