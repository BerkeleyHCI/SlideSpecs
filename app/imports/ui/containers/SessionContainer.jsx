import React from 'react';
import PropTypes from 'prop-types';
import BaseComponent from '../components/BaseComponent.jsx';
import Message from '../components/Message.jsx';
import {Link} from 'react-router-dom';

export default class SessionContainer extends BaseComponent {
  constructor(props) {
    super(props);
  }

  hasSlides() {
    return true;
  }

  render() {
    console.log(this.props);
    return <Message title="sessions!!!" subtitle="yes" />;
  }
}

SessionContainer.propTypes = {
  user: PropTypes.object, // current meteor user
  session: PropTypes.object, // current session
  files: PropTypes.array, // all visible files
};

SessionContainer.defaultProps = {
  user: null,
  session: {},
  files: [],
};
