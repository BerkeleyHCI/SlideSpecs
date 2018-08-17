import React, {Component} from 'react';
import PropTypes from 'prop-types';
import BaseComponent from '../components/BaseComponent.jsx';
import {
  //createFile,
  renameFile,
  deleteFile,
} from '../../api/files/methods.js';

// TODO - use CREATE validatedMethod

class IndividualFile extends Component {
  removeFile = () => {
    const {fileId} = this.props;
    deleteFile.call({fileId});
  };

  editFile = () => {
    const {fileId, fileName} = this.props;
    let validName = /[^a-zA-Z0-9 \.:\+()\-_%!&]/gi;
    let newName = window.prompt('New file name?', fileName) || '';
    let trimmed = newName.replace(validName, '-').trim();
    if (trimmed != '') {
      renameFile.call({fileId, newName: trimmed});
    } else {
      console.error('bad/empty file name');
    }
  };

  //<button onClick={this.editFile} className="btn btn-sm">
  //rename
  //</button>

  render() {
    const {fileName, fileSize, fileUrl, handleLoad} = this.props;
    return (
      <div className="file-item">
        <h4>
          {fileName} <small> {fileSize}</small>
        </h4>
        <img
          className="slide"
          src={fileUrl}
          onLoad={handleLoad}
          onError={() => (this.src = '/default.png')}
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
export default IndividualFile;
