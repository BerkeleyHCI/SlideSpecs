import React, {Component} from 'react';
import PropTypes from 'prop-types';
import BaseComponent from './BaseComponent.jsx';

class SelectUpload extends BaseComponent {
  render() {
    const uploading = this.props.inProgress;
    const {handleUpload} = this.props;
    return (
      <label className="btn btn-primary">
        + select
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
};

export default SelectUpload;
