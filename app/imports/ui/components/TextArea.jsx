import React, {Component} from 'react';
import PropTypes from 'prop-types';

class TextArea extends Component {
  componentDidMount = () => {
    $('textarea').autoResize();
  };

  keyDown = e => {
    const {handleKeyDown, handleSubmit} = this.props;
    const text = e.target.value.trim();
    handleKeyDown(text);
    if (text && e.keyCode === 13 && !e.shiftKey) {
      handleSubmit(text);
    }
  };

  render() {
    const {inRef, defaultValue, className} = this.props;
    return (
      <textarea
        type="text"
        ref={inRef}
        className={className}
        onKeyDown={this.keyDown}
        placeholder={defaultValue}
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
