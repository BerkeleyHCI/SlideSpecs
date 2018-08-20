import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {Session} from 'meteor/session.js';

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

  componentDidMount = () => {
    const saved = localStorage.getItem('feedbacks.reviewer');
    Session.set('reviewer', saved);
  };

  setName = () => {
    const name = this.getText();
    localStorage.setItem('feedbacks.reviewer', name);
    Session.set('reviewer', name);
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
      content = <Message title="no slides yet" subtitle="wait for presenter" />;
    } else {
      content = reviewer ? (
        <SlideReviewPage {...this.props} />
      ) : (
        this.renderName()
      );
    }
    return (
      this.renderRedirect() || (
        <div className="main-content no-v-pad">{content}</div>
      )
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
