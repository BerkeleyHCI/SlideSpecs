import React from 'react';
import {Meteor} from 'meteor/meteor';
import PropTypes from 'prop-types';
import {toast} from 'react-toastify';

import BaseComponent from '../components/BaseComponent.jsx';
import MenuContainer from '../containers/MenuContainer.jsx';
import AppNotification from '../components/AppNotification.jsx';
import AlertLink from '../components/AlertLink.jsx';
import {Message, FullMessage} from '../components/Message.jsx';
import {Files} from '../../api/files/files.js';
import Loading from '../components/Loading.jsx';
import DragUpload from '../components/DragUpload.jsx';
import SelectUpload from '../components/SelectUpload.jsx';
import TalkListItem from '../components/TalkListItem.jsx';
import {deleteSessionFiles} from '../../api/files/methods.js';
import {createTalk, setTalkProgress} from '../../api/talks/methods.js';

export default class SessionPage extends BaseComponent {
  deleteFiles = () => {
    const {session} = this.props;
    if (confirm('Delete ALL talks for this session?'))
      deleteSessionFiles.call({sessionId: session._id});
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
    let {sessionId, fileLocator} = this.props;

    const handleToast = ({msg, desc, icon, closeTime}) => {
      if (!closeTime) closeTime = 4000;
      toast(() => <AppNotification msg={msg} desc={desc} icon={icon} />, {
        autoClose: closeTime,
      });
    };

    if (files) {
      files.map(file => {
        // Allow uploading files under 30MB for now.
        const goodSize = file.size <= 30985760;
        const goodType = /(pdf|ppt|pptx|key)$/i.test(file.name);
        if (!goodSize || !goodType) {
          this.handleToast({
            msg: 'error',
            icon: 'times',
            desc:
              'Please only upload pdf/ppt/pptx, with size equal or less than 30MB.',
          });
          return; // skip this file.
        }

        const talkId = createTalk.call({
          sessionId,
          name: file.name,
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
          false, // dont autostart the uploadg
        );

        uploadInstance.on('start', (err, file) => {
          //console.log('started', file.name);
        });

        // TODO set the percent of the specific talk item for upload
        uploadInstance.on('progress', function(progress, file) {
          setTalkProgress.call({talkId, progress});
        });

        // TODO set the percent of the specific talk item for upload
        uploadInstance.on('uploaded', (err, file) => {
          //console.log('uploaded', file.name);
          setTalkProgress.call({talkId, progress: 100});
        });

        // TODO set status on talk item that uploading is done.
        uploadInstance.on('end', (err, file) => {
          //console.log('file:', file);
          handleToast({
            msg: file.name,
            icon: 'check',
            desc: 'upload complete',
          });
        });

        uploadInstance.on('error', (err, file) => {
          if (err) console.error(err);
          handleToast({
            msg: file.name,
            icon: 'times',
            desc: `Error uploading: ${err}`,
          });
        });

        uploadInstance.start();
      });
    }
  };

  render() {
    const {uploading} = this.state;
    const {session, name, talks, files, images} = this.props;
    const shareLink = window.location.origin + '/share/' + session._id;
    const uploadLink = window.location.origin + '/upload/' + session._id;

    //<h3> <small>{talks.length} talks</small> </h3>
    //<Message title="uploading..." subtitle={this.state.progress + '%'} />

    const content = (
      <div className="main-content">
        <h1>{name}</h1>

        <AlertLink
          text={'share this session with a public link'}
          bText={'open link'}
          link={shareLink}
        />

        <AlertLink
          text={'let presenters add their own slides'}
          bText={'open link'}
          link={uploadLink}
        />

        {uploading && (
          <div className="padded alert">
            <FullMessage title="uploading..." />
          </div>
        )}

        {talks.length > 0 && (
          <div>
            <ul className="v-pad list-group">
              {talks.map((talk, i) => (
                <TalkListItem
                  key={talk._id}
                  talk={talk}
                  iter={i}
                  images={images}
                  files={files}
                  linkPre="slides"
                  ordering={true}
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
