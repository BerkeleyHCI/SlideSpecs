/* eslint-disable react/no-unused-state */

import React, {Component} from 'react';
import {Redirect} from 'react-router-dom';

class BaseComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {redirectTo: null};
  }

  static getDerivedStateFromProps() {
    return {redirectTo: null};
  }

  redirectTo = path => {
    this.setState({redirectTo: path});
  };

  renderRedirect = () => {
    const redir = this.state.redirectTo;
    console.log(redir, this.state);
    return redir ? <Redirect to={redir} /> : null;
  };
}

export default BaseComponent;
