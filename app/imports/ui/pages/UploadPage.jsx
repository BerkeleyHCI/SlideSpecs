import {Meteor} from 'meteor/meteor';
import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {_} from 'lodash';

import {toast} from 'react-toastify';
import {Files} from '../../api/files/files.js';
import AppNotification from '../components/AppNotification.jsx';
import Loading from '../components/Loading.jsx';
import DragUpload from '../components/DragUpload.jsx';
import SelectUpload from '../components/SelectUpload.jsx';
import ConvertInstructions from '../components/ConvertInstructions.jsx';
import BaseComponent from '../components/BaseComponent.jsx';
import FileUpload from '../components/FileUpload.jsx';
import {Message} from '../components/Message.jsx';
import {deleteSessionFiles} from '../../api/files/methods.js';

class UploadPage extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      uploading: false,
      progress: 0,
    };
  }

  updateMason = () => {
    if (this.props.files) {
      new Masonry('.grid', {itemSelector: '.file-item'});
    }
  };

  componentDidMount() {
    this.updateMason();
  }

  componentDidUpdate() {
    this.updateMason();
  }

  deleteFiles = () => {
    const {sessionId} = this.props;
    deleteSessionFiles.call({sessionId});
  };

  handleDropUpload = files => {
    this.handleUpload(files);
  };

  handleSelectUpload = e => {
    e.preventDefault();
    const files = [...e.currentTarget.files];
    this.handleUpload(files);
  };

  handleUpload = files => {
    let uploadCount, uploadGroup;
    const startProg = () => this.setState({uploading: true});
    let {sessionId, fileLocator} = this.props;
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
        // TODO merge the progress for all uploads, creating single number percent.

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
          toast(
            () => (
              <AppNotification
                msg="success"
                desc="upload complete"
                icon="check"
              />
            ),
            {autoClose: 2000},
          );

          this.setState({
            uploading: false,
            progress: 0,
          });
        } else {
          // UPLOADING NOW
          this.setState({
            progress: Math.round(
              (100 * (files.length - uploadCount)) / files.length,
            ),
          });
        }
      }, 50);
    }
  };

  goHome = e => {
    e.preventDefault();
    this.redirectTo('/');
  };

  render() {
    const {uploading} = this.state;
    const {sessionId, name, files} = this.props;
    let uploadingMsg = <Message title="uploading..." subtitle={<Loading />} />;
    //<Message title="uploading..." subtitle={this.state.progress + '%'} />

    if (files) {
      let display =
        (!uploading &&
          files.map((aFile, key) => {
            let link = Files.findOne({_id: aFile._id}).link('original', '//');
            return (
              <FileUpload
                iter={key + 1}
                key={'file' + key}
                fileId={aFile._id}
                fileUrl={link}
                handleLoad={this.updateMason}
              />
            );
          })) ||
        [];

      return (
        this.renderRedirect() || (
          <div className="main-content">
            <h1>
              {files.length > 0 ? (
                <Link to={`/sessions/${sessionId}`}>
                  <span className="black"> ‹ </span>
                  {name}
                </Link>
              ) : (
                <span>{name}</span>
              )}
            </h1>

            <div className="custom-upload">
              {uploading && uploadingMsg}

              {!uploading && display.length > 0 && (
                <div>
                  <h2>manage slides</h2>
                  <button onClick={this.deleteFiles} className="btn btn-danger">
                    delete all
                  </button>
                  <div className="v-pad grid">{display}</div>
                </div>
              )}

              {!uploading && display.length === 0 && (
                <div className="alert">
                  select the presentations to upload.
                  <hr />
                  <DragUpload handleUpload={this.handleDropUpload} />
                  <hr />
                  <SelectUpload handleUpload={this.handleSelectUpload} />
                  <button onClick={this.goHome} className="btn btn-danger">
                    cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      );
    } else return <div>loading file list...</div>;
  }
}

export default UploadPage;
