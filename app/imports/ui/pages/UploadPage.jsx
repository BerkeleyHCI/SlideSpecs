import React from 'react';
import {Meteor} from 'meteor/meteor';
import PropTypes from 'prop-types';
import {toast} from 'react-toastify';

import BaseComponent from '../components/BaseComponent.jsx';
import MenuContainer from '../containers/MenuContainer.jsx';
import AuthPageSignIn from '../pages/AuthPageSignIn.jsx';
import AuthPageJoin from '../pages/AuthPageJoin.jsx';
import AppNotification from '../components/AppNotification.jsx';
import {Message} from '../components/Message.jsx';
import {Files} from '../../api/files/files.js';
import Loading from '../components/Loading.jsx';
import DragUpload from '../components/DragUpload.jsx';
import SelectUpload from '../components/SelectUpload.jsx';
import TalkListItem from '../components/TalkListItem.jsx';
import {deleteTalkFile} from '../../api/files/methods.js';
import {createTalk} from '../../api/talks/methods.js';

/*
 * This page is for the presenters to add their own slides, rather than
 * the default session manager slide which can upload multiple slides at one
 * time.
 *
 */

export default class UploadPage extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {uploading: false};
  }

  deleteTalkFile = () => {
    // TODO implement this
    const {sessionId} = this.props;
    if (confirm('Delete your talk?')) deleteTalkFile.call({sessionId});
  };

  handleDropUpload = files => {
    this.handleUpload(files);
  };

  handleSelectUpload = e => {
    e.preventDefault();
    const files = [...e.currentTarget.files];
    this.handleUpload(files);
  };

  handleUpload = allfiles => {
    let {sessionId, fileLocator} = this.props;
    // Only allow for uploading one file per talk.
    const file = allfiles[0];
    if (!file) {
      return false;
    }
    this.setState({uploading: true});
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

    uploadInstance.on('end', function(error, fileObj) {
      toast(
        () => (
          <AppNotification msg="success" desc="upload complete" icon="check" />
        ),
        {autoClose: 2000},
      );
      this.setState({
        uploading: false,
        progress: 0,
      });
      return {error, fileObj};
    });

    uploadInstance.on('error', function(error, fileObj) {
      console.error(`Error during upload: ${error}`);
      return {error, fileObj};
    });

    uploadInstance.start();
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
            <div className=" no-margin alert btns-group">
              <button onClick={this.deleteTalkFile} className="btn btn-empty">
                delete talk
              </button>
            </div>
          </div>
        )}

        {talks.length == 0 && (
          <div className="alert">
            add your presentation here.
            <SelectUpload
              labelText="+ new"
              className="pull-right btn-menu btn-primary"
              handleUpload={this.handleSelectUpload}
            />
            <hr />
            <DragUpload handleUpload={this.handleDropUpload} />
          </div>
        )}
      </div>
    );

    return <MenuContainer {...this.props} content={content} />;
  }
}

UploadPage.propTypes = {
  user: PropTypes.object,
  sessionId: PropTypes.string,
  talks: PropTypes.array,
  files: PropTypes.array,
};

UploadPage.defaultProps = {
  user: null,
  talks: [],
  files: [],
};
