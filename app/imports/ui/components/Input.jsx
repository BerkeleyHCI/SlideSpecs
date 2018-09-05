import React, {Component} from 'react';
import PropTypes from 'prop-types';

// Auto-resize fix (text-area, input)
// https://stackoverflow.com/questions/454202/creating-a-textarea-with-auto-resize

class Input extends Component {
  constructor(props) {
    super(props);
    this.inRef = React.createRef();
  }

  handleUpdate = txt => {
    this.input.value = txt;
  };

  keyDown = e => {
    const {handleKeyDown, handleSubmit} = this.props;
    const text = e.target.value.trim();
    console.log(text);
    handleKeyDown(text);
    if (text && e.keyCode === 13 && !e.shiftKey) {
      handleSubmit(text);
    }
  };

  render() {
    const {inRef, defaultValue, className} = this.props;
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

Input.defaultProps = {
  handleKeyDown: function() {},
  handleSubmit: function() {},
  defaultValue: 'enter text here',
  className: 'code',
};

export default Input;
