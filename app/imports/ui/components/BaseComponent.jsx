/* eslint-disable react/no-unused-state */

import React, {Component} from 'react';
import {Redirect} from 'react-router-dom';

class BaseComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {path: null};
  }

  componentDidUpdate = () => {
    if (this.state.path) this.setState({path: null});
  };

  redirectTo = path => {
    setTimeout(this.setState({path}), 500);
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
