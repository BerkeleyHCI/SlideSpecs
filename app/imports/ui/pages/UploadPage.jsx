import {Meteor} from 'meteor/meteor';
import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {_} from 'lodash';

import {toast} from 'react-toastify';
import {Files} from '../../api/files/files.js';
import AppNotification from '../components/AppNotification.jsx';
import BaseComponent from '../components/BaseComponent.jsx';
import FileUpload from '../components/FileUpload.jsx';
import Message from '../components/Message.jsx';
import {deleteSessionFiles} from '../../api/files/methods.js';

class UploadPage extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      uploading: false,
      progress: 0,
    };
  }

  componentDidMount() {
    new Masonry('.grid', {itemSelector: '.file-item'});
  }

  componentDidUpdate() {
    new Masonry('.grid', {itemSelector: '.file-item'});
  }

  componentWillUnmount() {
    //const mason = new Masonry('.grid', {itemSelector: '.file-item'});
    //mason.destroy();
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
    const {sessionId} = this.props;
    deleteSessionFiles.call({sessionId});
  };

  // TODO merge the progress for all uploads, creating single number percent.

  uploadIt = e => {
    let uploadCount;
    let uploadGroup;
    const startProg = () => this.setState({uploading: true});
    e.preventDefault();
    let {sessionId, fileLocator} = this.props;
    const files = [...e.currentTarget.files];
    if (files) {
      startProg();
      uploadCount = files.length;
      uploadGroup = files.length;
      files.map(file => {
        let uploadInstance = Files.insert(
          {
            file,
            meta: {
              locator: fileLocator,
              userId: Meteor.userId(),
              sessionId,
            },
            streams: 'dynamic',
            chunkSize: 'dynamic',
            allowWebWorkers: true,
          },
          false,
        );

        //uploadInstance.on('start', function() {});
        //uploadInstance.on('uploaded', function(error, fileObj) {});
        //uploadInstance.on('progress', function(progress, fileObj) {});

        uploadInstance.on('end', function(error, fileObj) {
          uploadCount -= 1;
        });

        uploadInstance.on('error', function(error, fileObj) {
          console.log(`Error during upload: ${error}`);
        });

        uploadInstance.start();
      });

      let uploadInterval = setInterval(() => {
        if (uploadCount === 0) {
          // DONE WITH ALL UPLOADS
          clearInterval(uploadInterval);
          const timeout = 3000;
          toast(
            () => (
              <AppNotification
                msg="success"
                desc="upload complete"
                icon="good"
              />
            ),
            {autoClose: timeout},
          );

          this.setState({
            uploading: false,
            progress: 0,
          });
          setTimeout(() => {
            this.redirectTo(`/sessions/${sessionId}`);
          }, timeout);
        } else {
          // UPLOADING NOW
          this.setState({
            progress: Math.round(
              100 * (files.length - uploadCount) / files.length,
            ),
          });
        }
      }, 50);
    }
  };

  // This is our progress bar, bootstrap styled
  // Remove this function if not needed

  showUploads() {
    if (this.state.uploading) {
      return (
        <Message title="uploading..." subtitle={this.state.progress + '%'} />
      );
    }
  }

  handleLoad = () => {
    new Masonry('.grid', {itemSelector: '.file-item'});
  };

  goHome = e => {
    e.preventDefault();
    this.redirectTo('/');
  };

  render() {
    const {sessionId, name, files} = this.props;
    if (files) {
      let fileCursors = files;
      let uploads = this.showUploads();
      let display =
        (!this.state.uploading &&
          fileCursors.map((aFile, key) => {
            let link = Files.findOne({_id: aFile._id}).link('original', '//');
            return (
              <FileUpload
                iter={key + 1}
                key={'file' + key}
                fileId={aFile._id}
                fileName={aFile.name}
                fileUrl={link}
                fileSize={this.humanFileSize(aFile.size)}
                handleLoad={this.handleLoad}
              />
            );
          })) ||
        null;

      return (
        this.renderRedirect() || (
          <div className="main-content">
            <h1>
              {files.length > 0 ? (
                <span>
                  ‹ <Link to={`/sessions/${sessionId}`}>{name}</Link>
                </span>
              ) : (
                <span>{name}</span>
              )}
            </h1>

            <div className="custom-upload">
              {!this.state.uploading &&
                display.length > 0 && (
                  <div>
                    <h2>manage slides</h2>
                    <button
                      onClick={this.deleteFiles}
                      className="btn btn-danger">
                      delete all
                    </button>
                  </div>
                )}
              {!this.state.uploading &&
                display.length === 0 && (
                  <div className="alert">
                    <h3>slide upload</h3>
                    first, export your presentation to a set of images. image
                    export guides:
                    <ul>
                      <li>
                        <a
                          href="https://hislide.io/2017/06/22/keynote-exporting-slides-png-jpg-tiff/"
                          target="_blank">
                          keynote (osx)
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://www.lifewire.com/create-pictures-from-powerpoint-slides-2767362"
                          target="_blank">
                          powerpoint
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://www.wikihow.com/Convert-PDF-to-Image-Files#Using_Adobe_Acrobat_Pro"
                          target="_blank">
                          general pdf (adobe acrobat)
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://superuser.com/questions/633698/"
                          target="_blank">
                          general pdf (image magick)
                        </a>
                      </li>
                    </ul>
                    <hr />
                    then, select and upload all the images at once.
                    <hr />
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
                    <button onClick={this.goHome} className="btn btn-danger">
                      cancel
                    </button>
                  </div>
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
