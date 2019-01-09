import React from 'react';
import PropTypes from 'prop-types';
import BaseComponent from '../components/BaseComponent.jsx';
import NameSet from '../components/NameSet.jsx';

export default class TalkContainer extends BaseComponent {
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

TalkContainer.propTypes = {
  talkId: PropTypes.string.isRequired,
};
