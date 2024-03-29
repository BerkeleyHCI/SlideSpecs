import React, { Component } from "react";
import PropTypes from "prop-types";
import autosize from "autosize";

class TextArea extends Component {
    componentDidMount = () => {
        setTimeout(() => autosize(this.props.inRef.current), 200);
        this.state = { text: "" };
    };

    componentDidUpdate = () => {
        setTimeout(() => autosize.update(this.props.inRef.current), 200);
    };

    keyDown = (e) => {
        const { inRef, handleKeyDown, handleSubmit } = this.props;
        const text = e.target.value.trim();
        handleKeyDown(text);
        if (text && e.keyCode === 13 && !e.shiftKey) {
            handleSubmit(text);
            setTimeout(() => autosize.update(inRef.current), 200);
        }
    };

    render() {
        const { inRef, defaultValue, handleKeyUp, className } = this.props;
        return (
            <textarea
                autoFocus
                type="text"
                ref={inRef}
                className={className}
                placeholder={defaultValue}
                onKeyDown={this.keyDown}
                onKeyUp={handleKeyUp}
            />
        );
    }
}

TextArea.propTypes = {
    inRef: PropTypes.object.isRequired,
};

TextArea.defaultProps = {
    handleKeyDown: function () {},
    handleSubmit: function () {},
    defaultValue: "enter text here",
    className: "code",
};

export default TextArea;
