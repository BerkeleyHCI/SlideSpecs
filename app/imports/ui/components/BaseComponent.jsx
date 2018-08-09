/* eslint-disable react/no-unused-state */

import React, {Component} from 'react';
import {Redirect} from 'react-router-dom';

class BaseComponent extends Component {
  static getDerivedStateFromProps() {
    return {redirectTo: null};
  }

  constructor(props) {
    super(props);
    this.state = {redirectTo: null};
  }

  redirectTo(path) {
    setTimeout(() => {
      this.setState({redirectTo: path});
    }, 10);
  }

  renderRedirect() {
    return this.state.redirectTo ? (
      <Redirect to={this.state.redirectTo} />
    ) : null;
  }
}

export default BaseComponent;
