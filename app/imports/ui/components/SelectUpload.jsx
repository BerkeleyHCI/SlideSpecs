import React from 'react';
import PropTypes from 'prop-types';
import BaseComponent from './BaseComponent.jsx';

class SelectUpload extends BaseComponent {
  render() {
    const {handleUpload, labelText, className, inProgress} = this.props;
    return (
      <label className={`btn ${className}`}>
        {labelText}
        <input
          type={"file"}
          id={"fileinput"}
          disabled={inProgress}
          ref={"fileinput"}
          onChange={handleUpload}
          multiple
        />
      </label>
    );
  }
}

SelectUpload.propTypes = {
  handleUpload: PropTypes.func.isRequired,
  labelText: PropTypes.string,
};

SelectUpload.defaultProps = {
  labelText: '+ select',
};

export default SelectUpload;
