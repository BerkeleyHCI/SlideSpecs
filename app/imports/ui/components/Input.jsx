import React, { Component } from "react";
import PropTypes from "prop-types";

class Input extends Component {
    keyDown = (e) => {
        const { handleKeyDown, handleSubmit } = this.props;
        const text = e.target.value.trim();
        handleKeyDown(text);
        if (text && e.keyCode === 13 && !e.shiftKey) {
            handleSubmit(text);
        }
    };

    render() {
        const { inRef, defaultValue, className } = this.props;
        return (
            <input
                type="text"
                ref={inRef}
                className={className}
                onKeyDown={this.keyDown}
                placeholder={defaultValue}
            />
        );
    }
}

Input.propTypes = {
    inRef: PropTypes.object.isRequired,
};

Input.defaultProps = {
    handleKeyDown: function () {},
    handleSubmit: function () {},
    defaultValue: "enter text here",
    className: "code",
};

export default Input;
