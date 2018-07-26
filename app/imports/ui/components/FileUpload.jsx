import React from 'react';
import BaseComponent from './BaseComponent.jsx';
import FileUploader from './FileUploader.jsx';

class FileUpload extends BaseComponent {
  render() {
    return (
      <div>
        <h1>FILE UPLOAD</h1>
        <FileUploader />
      </div>
    );
  }
}

export default FileUpload;
