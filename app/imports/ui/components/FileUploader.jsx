import {Meteor} from 'meteor/meteor';
import React, {Component} from 'react';
import BaseComponent from './BaseComponent.jsx';
import {Files} from '../../api/files/files.js';
import {_} from 'meteor/underscore';
import {withTracker} from 'meteor/react-meteor-data';

import IndividualFile from './FileIndividualFile.jsx';
const debug = require('debug')('demo:file');

class FileUploader extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      uploading: [],
      progress: 0,
      inProgress: false,
    };

    this.uploadIt = this.uploadIt.bind(this);
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

  uploadIt(e) {
    e.preventDefault();

    let self = this;

    if (e.currentTarget.files) {
      _.each(e.currentTarget.files, file => {
        let uploadInstance = Files.insert(
          {
            file: file,
            meta: {
              locator: self.props.fileLocator,
              userId: Meteor.userId(), // Optional, used to check on server for file tampering
            },
            streams: 'dynamic',
            chunkSize: 'dynamic',
            allowWebWorkers: true, // If you see issues with uploads, change this to false
          },
          false,
        );

        self.setState({
          uploading: uploadInstance, // Keep track of this instance to use below
          inProgress: true, // Show the progress bar now
        });

        // These are the event functions, don't need most of them, it shows where we are in the process
        uploadInstance.on('start', function() {
          console.log('Starting');
        });

        uploadInstance.on('end', function(error, fileObj) {
          console.log('On end File Object: ', fileObj);
        });

        uploadInstance.on('uploaded', function(error, fileObj) {
          console.log('uploaded: ', fileObj);

          // Remove the filename from the upload box
          self.refs['fileinput'].value = '';

          // Reset our state for the next file
          self.setState({
            uploading: [],
            progress: 0,
            inProgress: false,
          });
        });

        uploadInstance.on('error', function(error, fileObj) {
          console.log('Error during upload: ' + error);
        });

        uploadInstance.on('progress', function(progress, fileObj) {
          console.log('Upload Percentage: ' + progress);
          // Update our progress bar
          self.setState({
            progress: progress,
          });
        });

        uploadInstance.start(); // Must manually start the upload
      });
    }
  }

  // This is our progress bar, bootstrap styled
  // Remove this function if not needed
  //
  showUploads() {
    if (!_.isEmpty(this.state.uploading)) {
      return (
        <div>
          {this.state.uploading.file.name}
          <div className="progress progress-bar-default">
            <div
              style={{width: this.state.progress + '%'}}
              aria-valuemax="100"
              aria-valuemin="0"
              aria-valuenow={this.state.progress || 0}
              role="progressbar"
              className="progress-bar">
              <span className="sr-only">
                {this.state.progress}% Complete (success)
              </span>
              <span>{this.state.progress}%</span>
            </div>
          </div>
        </div>
      );
    }
  }

  render() {
    if (this.props.files) {
      let fileCursors = this.props.files;
      let uploads = this.showUploads();

      // Run through each file that the user has stored
      // (make sure the subscription only sends files owned by this user)
      let display = fileCursors.map((aFile, key) => {
        let link = Files.findOne({_id: aFile._id}).link(); //The "view/download" link
        // Send out components that show details of each file
        return (
          <div key={'file' + key}>
            <IndividualFile
              fileId={aFile._id}
              fileName={aFile.name}
              fileUrl={link}
              fileSize={this.humanFileSize(aFile.size)}
            />
          </div>
        );
      });

      // todo: this is a single call, need to make reactive
      return (
        <div className="container slides-container">
          <h1>upload slides </h1>
          <div className="container">
            <input
              type="file"
              id="fileinput"
              disabled={this.state.inProgress}
              ref="fileinput"
              onChange={this.uploadIt}
              multiple
            />
            <br />
            <br />
            <div className="row">{uploads}</div>
            {display}
          </div>
        </div>
      );
    } else return <div>loading file list...</div>;
  }
}

export default FileUploader;
