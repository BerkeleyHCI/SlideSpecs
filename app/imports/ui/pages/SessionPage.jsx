import React from 'react';
import PropTypes from 'prop-types';
import {toast} from 'react-toastify';
import {Link} from 'react-router-dom';

import BaseComponent from '../components/BaseComponent.jsx';
import MenuContainer from '../containers/MenuContainer.jsx';
import AppNotification from '../components/AppNotification.jsx';
import {Message} from '../components/Message.jsx';
import {Files} from '../../api/files/files.js';
import Loading from '../components/Loading.jsx';
import DragUpload from '../components/DragUpload.jsx';
import SelectUpload from '../components/SelectUpload.jsx';
import ConvertInstructions from '../components/ConvertInstructions.jsx';
import TalkListItem from '../components/TalkListItem.jsx';
import SlideFile from '../components/SlideFile.jsx';
import {deleteSessionFiles} from '../../api/files/methods.js';
import {createTalk} from '../../api/talks/methods.js';

export default class SessionPage extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      uploading: false,
      progress: 0,
    };
  }

  componentDidMount = () => {};

  deleteFiles = () => {
    const {sessionId} = this.props;
    if (confirm('Delete ALL talks for this session?'))
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
    const {sessionId, name, talks, files, images} = this.props;
    const shareLink = window.location.origin + '/share/' + sessionId;

    if (uploading) {
      return <Message title="uploading..." subtitle={<Loading />} />;
      //<Message title="uploading..." subtitle={this.state.progress + '%'} />
    }

    //<h3> <small>{talks.length} talks</small> </h3>

    const content = (
      <div className="main-content">
        <h1>{name}</h1>

        <div className="alert">
          <a className="black" href={shareLink} target="_blank">
            share this session with a public link
            <button className="pull-right btn-menu btn-primary">open</button>
          </a>
        </div>

        {talks.length > 0 && (
          <div>
            <ul className="v-pad list-group">
              {talks.map(talk => (
                <TalkListItem
                  key={talk._id}
                  talk={talk}
                  images={images}
                  files={files}
                  linkPre="slides"
                  sessionOwner={this.props.sessionOwner}
                />
              ))}
            </ul>
          </div>
        )}

        <div className="alert">
          add {talks.length > 0 && ' more '} presentations here.
          <SelectUpload
            labelText="+ new"
            className="pull-right btn-menu btn-primary"
            handleUpload={this.handleSelectUpload}
          />
          <hr />
          <DragUpload handleUpload={this.handleDropUpload} />
          {talks.length > 0 && (
            <div className="btns-group">
              <button onClick={this.deleteFiles} className="btn btn-empty">
                delete all
              </button>
            </div>
          )}
        </div>
      </div>
    );

    return <MenuContainer {...this.props} content={content} />;
  }
}

SessionPage.propTypes = {
  user: PropTypes.object,
  sessionId: PropTypes.string,
  talks: PropTypes.array,
  files: PropTypes.array,
};

SessionPage.defaultProps = {
  user: null,
  talks: [],
  files: [],
};
