/* eslint-disable react/no-unused-state */

import {Meteor} from 'meteor/meteor';
import React, {Component} from 'react';
import {Redirect} from 'react-router-dom';

class BaseComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {path: null, rAuth: null};
  }

  componentDidUpdate = () => {
    const {path, rAuth} = this.state;
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
