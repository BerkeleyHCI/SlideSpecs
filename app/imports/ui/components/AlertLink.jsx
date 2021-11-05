import React, { Component } from "react";
import PropTypes from "prop-types";

class AlertLink extends Component {
    render() {
        const { link, text, bText, blank, center, handleClick } = this.props;

        let ref;
        if (blank) {
            ref = {
                target: "_blank",
                rel: "noopener noreferrer",
            };
        }

        return (
            <a
                onClick={handleClick}
                className="link-alert"
                href={link}
                {...ref}
            >
                <div className={"alert " + (center ? "centered" : "")}>
                    {text}
                    {bText && (
                        <button className="pull-right btn-menu btn-primary">
                            {bText}
                        </button>
                    )}
                </div>
            </a>
        );
    }
}

AlertLink.propTypes = {
    handleClick: PropTypes.func,
    link: PropTypes.string,
    text: PropTypes.string,
    bText: PropTypes.string,
    blank: PropTypes.bool,
};

AlertLink.defaultProps = {
    handleClick: function () {},
    center: false,
    blank: false,
    text: "link",
    link: "#",
};

export default AlertLink;
