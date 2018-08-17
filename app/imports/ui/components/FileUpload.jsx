import React, {Component} from 'react';
import PropTypes from 'prop-types';
import BaseComponent from '../components/BaseComponent.jsx';
import {deleteFile} from '../../api/files/methods.js';

class FileUpload extends BaseComponent {
  removeFile = () => {
    const {fileId} = this.props;
    deleteFile.call({fileId});
  };

  render() {
    const {src} = this.state;
    const {iter, fileName, fileSize, fileUrl, handleLoad} = this.props;
    return (
      <div className="file-item">
        <h4>
          {fileName} <small> {fileSize}</small>
        </h4>
        <div className="overlay">{iter}</div>
        <img
          className="slide"
          src={src ? src : fileUrl}
          onLoad={handleLoad}
          onError={() => this.setState({src: '/default.png'})}
        />
        <div className="btns-group">
          <button onClick={this.removeFile} className="btn btn-sm">
            delete
          </button>
        </div>
      </div>
    );
  }
}
export default FileUpload;
