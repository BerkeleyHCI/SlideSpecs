import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session.js';

class AlertLink extends Component {
  render() {
    const {link, text, bText, blank, center} = this.props;

    let ref;
    if (blank) {
      ref = {
        target: '_blank',
        rel: 'noopener noreferrer',
      };
    }

    return (
      <a className="link-alert" href={link} {...ref}>
        <div className={'alert ' + (center ? 'centered' : '')}>
          {text}
          {bText && (
            <button className="pull-right btn-menu btn-primary">{bText}</button>
          )}
        </div>
      </a>
    );
  }
}

AlertLink.propTypes = {
  link: PropTypes.string,
  text: PropTypes.string,
  bText: PropTypes.string,
  blank: PropTypes.bool,
};

AlertLink.defaultProps = {
  center: false,
  blank: false,
  text: 'link',
  link: '#',
};

export default AlertLink;
