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
    } else if (this.hasSlides()) {
      return <Message title="session" subtitle="has slides" />;
    } else {
      return <Message title="session" subtitle="no slides" />;
    }
  }

  render() {
    console.log(this.props);
    const {match, name} = this.props;
    const _id = match.params.id;
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
  //session: PropTypes.object, // current session
  files: PropTypes.array, // all visible files
};

SessionContainer.defaultProps = {
  user: null,
  session: {},
  files: [],
};
