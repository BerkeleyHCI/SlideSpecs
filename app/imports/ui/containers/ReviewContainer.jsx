import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {Session} from 'meteor/session.js';

import Input from '../components/Input.jsx';
import {Message} from '../components/Message.jsx';
import BaseComponent from '../components/BaseComponent.jsx';
import CommentPage from '../pages/CommentPage.jsx';

export default class ReviewContainer extends BaseComponent {
  render() {
    let content;
    const {files, reviewer} = this.props;
    if (!files || files.length <= 0) {
      content = <Message title="no slides yet" subtitle="wait for presenter" />;
    } else {
      content = reviewer ? <FeedbackPage {...this.props} /> : <NameSet />;
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
