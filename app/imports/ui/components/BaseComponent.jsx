/* eslint-disable react/no-unused-state */
import React, {Component} from 'react';
import {Redirect} from 'react-router-dom';
import {logEvent} from '../../api/events/methods.js';

class BaseComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {path: null};
  }

  log = data => {
    const {reviewer, talk} = this.props;
    const base = {reviewer, talk};

    let string;
    if (typeof data === 'string') {
      string = JSON.stringify({data, ...base});
    } else if (Object.keys.length > 0) {
      string = JSON.stringify({...data, ...base});
    } else {
      string = JSON.stringify({data, ...base});
    }

    logEvent.call({data: string});
  };

  componentDidUpdate = () => {
    const {path} = this.state;
    if (path) {
      this.setState({path: null});
    }
  };

  redirectTo = path => {
    this.setState({path});
  };

  renderRedirect = () => {
    const {path} = this.state;
    if (path) {
      return <Redirect to={path} />;
    } else {
      return null;
    }
  };
}

export default BaseComponent;
