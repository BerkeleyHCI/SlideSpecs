import React, { Component } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session.js";

class AlertLink extends Component {
  render() {
    const { link, text, bText, blank } = this.props;

    let ref;
    if (blank) {
      ref = {
        target: "_blank",
        rel: "noopener noreferrer"
      };
    }

    return (
      <a className="link-alert" href={link} {...ref}>
        <div className="alert">
          <button className="pull-right btn-menu btn-primary">{bText}</button>
          {text}
        </div>
      </a>
    );
  }
}

AlertLink.propTypes = {
  link: PropTypes.string,
  text: PropTypes.string,
  bText: PropTypes.string,
  blank: PropTypes.bool
};

AlertLink.defaultProps = {
  link: "/",
  text: "link",
  bText: "open",
  blank: false
};

export default AlertLink;
