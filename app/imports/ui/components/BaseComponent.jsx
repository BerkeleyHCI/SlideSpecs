/* eslint-disable react/no-unused-state */

import React, {Component} from 'react';
import {Redirect} from 'react-router-dom';

class BaseComponent extends Component {
  static getDerivedStateFromProps() {
    return {redirectTo: null};
  }

  constructor(props) {
    super(props);
    this.state = {
      redirectTo: null,
    };
    this.handleLocaleChange = this.handleLocaleChange.bind(this);
  }

  handleLocaleChange(locale) {
    this.setState({locale});
  }

  redirectTo(path) {
    this.setState({redirectTo: path});
  }

  renderRedirect() {
    return this.state.redirectTo ? (
      <Redirect to={this.state.redirectTo} />
    ) : null;
  }
}

export default BaseComponent;
