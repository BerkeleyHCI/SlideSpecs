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
    const {talk} = this.props;
    if (confirm('Delete the uploaded file for your talk?'))
      deleteTalkFile.call({talkId: talk._id});
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
    // Only allow for uploading one file per talk.
    let {sessionId, fileLocator} = this.props;
    const file = allfiles[0];
    if (!file) {
      return false;
    } else {
      this.setState({uploading: true});
    }

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
      this.setState({uploading: false});
    });

    uploadInstance.on('error', function(error, fileObj) {
      console.error(`Error during upload.`, error);
    });

    uploadInstance.start();
  };

  render() {
    const {uploading} = this.state;
    const {name, talk, files, images} = this.props;

    if (uploading) {
      return <Message title="uploading..." subtitle={<Loading />} />;
    }

    const content = (
      <div className="main-content">
        <h1>{name}</h1>

        {talk && (
          <div>
            <ul className="v-pad list-group">
              <TalkListItem
                key={talk._id}
                talk={talk}
                images={images}
                files={files}
                linkPre="slides"
                sessionOwner={true}
              />
            </ul>
          </div>
        )}

        {!talk && (
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
  files: PropTypes.array,
  talk: PropTypes.object,
};

UploadPage.defaultProps = {
  user: null,
  files: [],
};
