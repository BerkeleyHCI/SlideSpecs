import React, {Component} from 'react';
import BaseComponent from '../components/BaseComponent.jsx';
import PropTypes from 'prop-types';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session.js';

class LocalLink extends BaseComponent {
  render() {
    const {to, className} = this.props;
    return (
      this.renderRedirect() || (
        <span
          className={`span-link ${className || ''}`}
          onClick={() => this.redirectTo(to)}>
          {this.props.children}
        </span>
      )
    );
  }
}

export default LocalLink;
