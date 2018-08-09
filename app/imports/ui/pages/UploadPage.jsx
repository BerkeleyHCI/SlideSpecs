import {Meteor} from 'meteor/meteor';
import React, {Component} from 'react';
import {_} from 'meteor/underscore';
import {withTracker} from 'meteor/react-meteor-data';
import {Link} from 'react-router-dom';

import {Files} from '../../api/files/files.js';
import BaseComponent from '../components/BaseComponent.jsx';
import IndividualFile from '../components/FileIndividualFile.jsx';
import Message from '../components/Message.jsx';

import {deleteSessionFiles} from '../../api/files/methods.js';

class UploadPage extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      uploading: [],
      progress: 0,
    };

    this.uploadIt = this.uploadIt.bind(this);
  }

  componentDidMount() {
    new Masonry('.grid', {itemSelector: '.file-item'});
  }

  componentDidUpdate() {
    new Masonry('.grid', {itemSelector: '.file-item'});
  }

  componentWillUnmount() {
    const mason = new Masonry('.grid', {itemSelector: '.file-item'});
    mason.destroy();
  }

  humanFileSize(bytes) {
    let fileSizeInBytes = bytes;
    var i = -1;
    var byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
    do {
      fileSizeInBytes = fileSizeInBytes / 1024;
      i++;
    } while (fileSizeInBytes > 1024);
    return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
  }

  deleteFiles = () => {
    const {_id} = this.props;
    deleteSessionFiles.call({sessionId: _id});
  };

  // TODO merge the progress for all uploads, creating single number percent.

  uploadIt = e => {
    e.preventDefault();
    let {_id, fileLocator} = self.props;
    let files = e.currentTarget.files;
    if (files) {
      let uploadCount = files.length;
      let uploadMaxProg = files.length * 100;
      _.each(e.currentTarget.files, file => {
        let uploadInstance = Files.insert(
          {
            file,
            meta: {
              locator: fileLocator,
              sessionId: _id,
              userId: Meteor.userId(),
            },
            streams: 'dynamic',
            chunkSize: 'dynamic',
            allowWebWorkers: true,
          },
          false,
        );

        self.setState({
          uploading: uploadInstance, // Keep track of this instance to use below
          inProgress: true, // Show the progress bar now
        });

        uploadInstance.on('start', function() {});
        uploadInstance.on('uploaded', function(error, fileObj) {});
        uploadInstance.on('end', function(error, fileObj) {
          uploadCount -= 1;
        });

        uploadInstance.on('error', function(error, fileObj) {
          console.log(`Error during upload: ${error}`);
        });

        uploadInstance.on('progress', function(progress, fileObj) {
          //console.log('Upload Percentage: ' + progress);
          self.setState({progress}); // Update our progress bar
        });

        uploadInstance.start(); // Must manually start the upload
      });

      let uploadInterval = setInterval(() => {
        if (uploadCount === 0) {
          clearInterval(uploadInterval);
          self.setState({
            uploading: [],
            progress: 0,
            inProgress: false,
          });
          setTimeout(() => {
            this.redirectTo(`/sessions/${_id}`);
          }, 1000);
        }
      }, 100);
    }
  };

  // This is our progress bar, bootstrap styled
  // Remove this function if not needed

  showUploads() {
    if (!_.isEmpty(this.state.uploading)) {
      return (
        <Message title="uploading now" subtitle={this.state.progress + '%'} />
      );
    }
  }

  handleLoad = () => {
    new Masonry('.grid', {itemSelector: '.file-item'});
  };

  render() {
    const {_id, name, files} = this.props;
    if (files) {
      let fileCursors = files;
      let uploads = this.showUploads();
      let display = fileCursors.map((aFile, key) => {
        let link = Files.findOne({_id: aFile._id}).link('original', '//');
        return (
          <IndividualFile
            key={'file' + key}
            fileId={aFile._id}
            fileName={aFile.name}
            fileUrl={link}
            fileSize={this.humanFileSize(aFile.size)}
            handleLoad={this.handleLoad}
          />
        );
      });

      return (
        this.renderRedirect() || (
          <div className="main-content">
            <h1>
              {files.length > 0 ? (
                <Link to={`/sessions/${_id}`}>{name}</Link>
              ) : (
                <span>{name}</span>
              )}
            </h1>
            <h2>manage slides</h2>

            <div className="custom-upload">
              <label className="btn btn-primary">
                + upload slides
                <input
                  type="file"
                  id="fileinput"
                  disabled={this.state.inProgress}
                  ref="fileinput"
                  onChange={this.uploadIt}
                  multiple
                />
              </label>
              <button onClick={this.deleteFiles} className="btn btn-danger">
                delete all
              </button>
              {this.state.uploading.length === 0 &&
                display.length === 0 && (
                  <Message title="no slides yet" subtitle="add above" />
                )}
              {uploads}
            </div>
            <div className="padded grid">{display}</div>
          </div>
        )
      );
    } else return <div>loading file list...</div>;
  }
}

export default UploadPage;
