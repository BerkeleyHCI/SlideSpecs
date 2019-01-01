import React, {Component} from 'react';
import PropTypes from 'prop-types';
import BaseComponent from './BaseComponent.jsx';

class SelectUpload extends BaseComponent {
  render() {
    const uploading = this.props.inProgress;
    const {handleUpload, labelText, className} = this.props;
    return (
      <label className={'btn ' + className}>
        {labelText}
        <input
          type="file"
          id="fileinput"
          disabled={uploading}
          ref="fileinput"
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
