import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {Session} from 'meteor/session.js';

import Input from '../components/Input.jsx';
import Message from '../components/Message.jsx';
import BaseComponent from '../components/BaseComponent.jsx';
import SlideReviewPage from '../pages/CommentPage.jsx';

export default class ReviewContainer extends BaseComponent {
  constructor(props) {
    super(props);
    this.inRef = React.createRef();
  }

  componentDidMount = () => {
    const saved = localStorage.getItem('feedbacks.reviewer');
    const mu = Meteor.user();
    let username;
    if (mu) {
      username = mu.username;
    }

    if (username && saved !== username) {
      localStorage.setItem('feedbacks.reviewer', username);
      Session.set('reviewer', username);
    } else if (saved && saved != 'null') {
      Session.set('reviewer', saved);
    }
  };

  setName = () => {
    const name = this.inRef.current.value;
    localStorage.setItem('feedbacks.reviewer', name);
    Session.set('reviewer', name);
  };

  renderName = () => {
    return (
      <div>
        <h2 className="nav-head clearfix">share feedback</h2>
        <div className="h-pad">
          <div className="alert">
            <h3>name entry</h3>
            please enter your name before providing feedback:
            <hr />
            <Input
              inRef={this.inRef}
              handleSubmit={this.setName}
              defaultValue="your name"
            />
            <hr />
            <div className="btns-group">
              <button onClick={this.setName} className="btn btn-menu">
                set name
              </button>
            </div>
          </div>
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
        <div className="main-content no-pad">{content}</div>
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
