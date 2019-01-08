import React from 'react';
import PropTypes from 'prop-types';
import BaseComponent from '../components/BaseComponent.jsx';
import NameSet from '../components/NameSet.jsx';

export default class ReviewContainer extends BaseComponent {
  render() {
    let content;
    const {reviewer, Comp, ...other} = this.props;
    if (!reviewer) {
      content = <NameSet />;
    } else {
      content = <Comp {...other} />;
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
