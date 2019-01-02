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
import TalkListItem from '../components/TalkListItem.jsx';
import BaseComponent from '../components/BaseComponent.jsx';
import FileUpload from '../components/FileUpload.jsx';
import {Message} from '../components/Message.jsx';
import {deleteSessionFiles} from '../../api/files/methods.js';
import {createTalk} from '../../api/talks/methods.js';

class TalkPage extends BaseComponent {
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
    let {sessionId, talks, fileLocator} = this.props;
    if (files) {
      startProg();
      uploadCount = files.length;
      uploadGroup = files.length;
      files.map(file => {
        // Make a new talk object for each slide presentation.
        const talkId = createTalk.call({
          sessionId,
          name: file.name.replace(/\.[^/.]+$/, ''),
        });

        let uploadInstance = Files.insert(
          {
            file,
            meta: {
              locator: fileLocator,
              userId: Meteor.userId(),
              sessionId,
              talkId,
            },
            //transport: 'http',
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

  render() {
    const {uploading} = this.state;
    const {sessionId, talks, name, files, images} = this.props;

    if (uploading) {
      return <Message title="uploading..." subtitle={<Loading />} />;
      //<Message title="uploading..." subtitle={this.state.progress + '%'} />
    }

    return (
      <div className="main-content">
        <h1>
          <Link to={`/`}>
            <span className="black"> ‹ </span>
            {name}
          </Link>
        </h1>

        {images.length > 0 && (
          <div>
            <ul className="v-pad list-group">
              {talks.map(talk => (
                <TalkListItem
                  key={talk._id}
                  talk={talk}
                  images={images}
                  files={files}
                />
              ))}
            </ul>
          </div>
        )}

        <div className="btns-group">
          <button onClick={this.deleteFiles} className="btn btn-empty">
            delete all
          </button>
        </div>
      </div>
    );
  }
}

export default TalkPage;
