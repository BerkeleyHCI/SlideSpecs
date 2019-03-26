import React, {Component} from 'react';
import PropTypes from 'prop-types';
import autosize from 'autosize';

class TextArea extends Component {
  componentDidMount = () => {
    setTimeout(() => autosize(this.props.inRef.current), 200);
  };

  componentDidUpdate = () => {
    setTimeout(() => autosize.update(this.props.inRef.current), 200);
  };

  keyDown = e => {
    const {inRef, handleKeyDown, handleSubmit} = this.props;
    const text = e.target.value.trim();
    var charStr = String.fromCharCode(e.keyCode || e.which);
    handleKeyDown(text + charStr.toLowerCase());
    if (text && e.keyCode === 13 && !e.shiftKey) {
      handleSubmit(text);
      setTimeout(() => autosize.update(inRef.current), 200);
    }
  };

  render() {
    const {inRef, defaultValue, className} = this.props;
    return (
      <textarea
        autoFocus
        type="text"
        ref={inRef}
        className={className}
        placeholder={defaultValue}
        onKeyDown={this.keyDown}
      />
    );
  }
}

TextArea.propTypes = {
  inRef: PropTypes.object.isRequired,
};

TextArea.defaultProps = {
  handleKeyDown: function() {},
  handleSubmit: function() {},
  defaultValue: 'enter text here',
  className: 'code',
};

export default TextArea;
