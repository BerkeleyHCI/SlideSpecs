/* eslint-disable react/no-unused-state */

import React, {Component} from 'react';
import {Redirect} from 'react-router-dom';
import {serverLog} from '../../api/myLogger.js';

class BaseComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {path: null};
  }

  log = data => {
    const {reviewer, talk} = this.props;
    serverLog({...data, reviewer, talk});
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
