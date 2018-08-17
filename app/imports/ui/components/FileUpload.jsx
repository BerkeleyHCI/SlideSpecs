import React, {Component} from 'react';
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
    const err = () => this.setState({src: '/default.png'});
    const i = src ? src : fileUrl;
    return (
      <div className="file-item">
        <h4>
          {fileName} <small> {fileSize}</small>
        </h4>
        <div className="slide-container">
          <div className="overlay">
            <p>{iter}</p>
          </div>
          <img className="slide" src={i} onLoad={handleLoad} onError={err} />
        </div>
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
