import React from 'react';
import PropTypes from 'prop-types';
import {Session} from 'meteor/session.js';
import BaseComponent from '../components/BaseComponent.jsx';
import NameSet from '../components/NameSet.jsx';

export default class ReviewContainer extends BaseComponent {
  render() {
    const {reviewer, Comp} = this.props;
    let content;
    if (!reviewer) {
      content = <NameSet />;
    } else {
      content = <Comp {...this.props} />;
    }

    return this.renderRedirect() || content;
  }
}

ReviewContainer.propTypes = {
  reviewer: PropTypes.string,
};

ReviewContainer.defaultProps = {
  reviewer: '',
};
