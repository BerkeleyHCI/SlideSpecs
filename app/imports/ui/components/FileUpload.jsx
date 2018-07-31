import React from 'react';
import BaseComponent from './BaseComponent.jsx';
import FileUploader from './FileUploader.jsx';

class FileUpload extends BaseComponent {
  render() {
    return (
      <div className="container slides-container">
        <h1>SLIDE UPLOAD</h1>
        <FileUploader {...this.props} />
      </div>
    );
  }
}

export default FileUpload;
