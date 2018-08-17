import React, {Component} from 'react';
import {deleteFile} from '../../api/files/methods.js';
import Img from '../components/Image.jsx';

class FileUpload extends Component {
  removeFile = () => {
    const {fileId} = this.props;
    deleteFile.call({fileId});
  };

  render() {
    const {iter, fileName, fileSize, fileUrl, handleLoad} = this.props;
    return (
      <div className="file-item">
        <h4>
          {fileName} <small> {fileSize}</small>
        </h4>
        <div className="slide-container">
          <div className="overlay">
            <p>{iter}</p>
          </div>
          <Img className="slide" source={fileUrl} onLoad={handleLoad} />
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
