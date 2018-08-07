import React from 'react';
import PropTypes from 'prop-types';
import BaseComponent from '../components/BaseComponent.jsx';
import Message from '../components/Message.jsx';
import {Link} from 'react-router-dom';

export default class SessionContainer extends BaseComponent {
  constructor(props) {
    super(props);
  }

  hasFeedback() {
    return false;
  }

  hasSlides() {
    return true;
  }

  getContent() {
    if (this.hasFeedback()) {
      return <Message title="session" subtitle="has feedback" />;
      // redirect to viewing
    } else if (this.hasSlides()) {
      return <Message title="session" subtitle="has slides" />;
      // redirect to link sharing, code generation
    } else {
      return <Message title="session" subtitle="no slides" />;
      // redirect to uploading
    }
  }

  render() {
    const {_id, name, files} = this.props;
    return (
      <div className="main-content">
        <h1> {name} </h1>
        <Link to={`/upload/${_id}`}>upload slides</Link>
        {this.getContent()}
      </div>
    );
  }
}

SessionContainer.propTypes = {
  user: PropTypes.object, // current meteor user
  _id: PropTypes.string, // current session
  files: PropTypes.array, // current session files
};

SessionContainer.defaultProps = {
  user: null,
  files: [],
};
