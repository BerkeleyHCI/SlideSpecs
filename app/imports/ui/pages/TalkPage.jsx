import React from 'react';
import {Meteor} from 'meteor/meteor';
import PropTypes from 'prop-types';
import {toast} from 'react-toastify';

import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {deleteTalk} from '../../api/talks/methods.js';
import {Files} from '../../api/files/files.js';
import {Images} from '../../api/images/images.js';

import BaseComponent from '../components/BaseComponent.jsx';
import MenuContainer from '../containers/MenuContainer.jsx';
import AppNotification from '../components/AppNotification.jsx';
import AlertLink from '../components/AlertLink.jsx';
import {FullMessage} from '../components/Message.jsx';
import {Files} from '../../api/files/files.js';
import DragUpload from '../components/DragUpload.jsx';
import SelectUpload from '../components/SelectUpload.jsx';
import TalkListItem from '../components/TalkListItem.jsx';
import {deleteTalkFiles} from '../../api/files/methods.js';
import {createTalk, setTalkProgress} from '../../api/talks/methods.js';
import BaseComponent from '../components/BaseComponent.jsx';
import SlideFile from '../components/SlideFile.jsx';
import TalkListItem from '../components/TalkListItem.jsx';

export default class TalkPage extends BaseComponent {
  deleteFiles = () => {
    const {Talk} = this.props;
    if (confirm('Delete ALL talks for this Talk?'))
      deleteTalkFiles.call({TalkId: Talk._id});
  };

  updateMason = () => {
    if (this.props.images) {
      const grid = document.getElementById('grid');
      const mason = new Masonry(grid, {itemSelector: '.file-item'});
      this.setState({mason});
    }
  };

  componentDidMount() {
    this.updateMason();
  }

  componentDidUpdate() {
    this.updateMason();
  }

  handleDropUpload = files => {
    this.handleUpload(files);
  };

  handleSelectUpload = e => {
    e.preventDefault();
    const files = [...e.currentTarget.files];
    this.handleUpload(files);
  };

  handleUpload = files => {
    let {TalkId, fileLocator} = this.props;
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
        //const goodType = /(pdf|ppt|pptx|key)$/i.test(file.name);
        const goodType = /(pdf)$/i.test(file.name);
        if (!goodSize || !goodType) {
          handleToast({
            msg: 'error',
            icon: 'times',
            desc:
              //'Please only upload pdf/ppt/pptx, with size equal or less than 30MB.',
              'Please only upload pdf files, with size equal or less than 30MB.',
          });
          return; // skip this file.
        }

        const talkId = createTalk.call({
          TalkId,
          name: file.name,
        });

        let uploadInstance = Files.insert(
          {
            file,
            meta: {
              locator: fileLocator,
              userId: Meteor.userId(),
              TalkId,
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
          console.log('uploaded', file.name);
          setTalkProgress.call({talkId, progress: 100});
        });

        // TODO set status on talk item that uploading is done.
        uploadInstance.on('end', (err, file) => {
          console.log('file:', file);
          handleToast({
            msg: file.name,
            icon: 'check',
            desc: 'upload complete',
          });
        });

        uploadInstance.on('error', (err, file) => {
          if (err) console.error(err, file);
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

  deleteTalk = () => {
    const {talkId, session} = this.props;
    this.redirectTo(session._id);
    deleteTalk.call({talkId});
  };


  //<button
  //onClick={this.deleteTalk}
  //className="btn btn-menu pull-right">
  //delete presentation
  //</button>


  render() {
    const {uploading} = this.state;
    const {talk, name, talks, files, images, comments} = this.props;
    const shareLink = window.location.origin + '/share/' + Talk._id;

    let talkFile;
    try {
      let fileParams = {'meta.talkId': talk._id};
      talkFile = Files.findOne(fileParams).link('original', '//');
    } catch (e) {
      talkFile = '/404';
    }
    let imageSet = images.map((i, key) => (
      <SlideFile
        key={'file-' + key}
        iter={key + 1}
        fileUrl={Images.findOne(i._id).link('original', '//')}
        handleLoad={this.updateMason}
        fileId={i._id}
        fileName={i.name}
      />
    ));

    // TODO update this into the secret Talk field instead of rthe regular // id
    const uploadLink = window.location.origin + '/upload/' + Talk._id;

    //<h3> <small>{talks.length} talks</small> </h3>
    //<Message title="uploading..." subtitle={this.state.progress + '%'} />

    const content = (
      <div className="main-content">
        <h1>{name}</h1>

        <AlertLink
          text={'share this Talk with a public link'}
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
                  iter={i}
                  key={talk._id}
                  talk={talk}
                  images={images}
                  files={files}
                  linkPre="slides"
                  ordering={true}
                  TalkOwner={this.props.TalkOwner}
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
                <div className="main-content">
          <h1>
            <Link to={`/Talks/${session._id}`}>
              <span className="black"> ‹ </span>
              {session.name}
            </Link>

            <small> / {name}</small>
          </h1>

          <div className="alert">
            <ul>
              <li>slides: {images.length}</li>
              <li>comments: {comments.length}</li>
            </ul>
            <hr />

            <div className="btns-menu-space">
              <a download href={talkFile}>
                <button className="btn btn-menu btn-primary">
                  download original
                </button>
              </a>
              <Link to={`/comment/${talk._id}`}>
                <button className="btn btn-menu">view comments</button>
              </Link>
            </div>
          </div>

          {images.length == 0 && <TalkListItem talk={talk} />}

          <div id="grid">{imageSet}</div>
        </div>
      </div>
    );

    return <MenuContainer {...this.props} content={content} />;
  }
}

TalkPage.propTypes = {
  user: PropTypes.object,
  TalkId: PropTypes.string,
  files: PropTypes.array,
  images: PropTypes.array,
    talkId: PropTypes.string,
  comments: PropTypes.array,

};

TalkPage.defaultProps = {
  user: null,
  talks: [],
  files: [],
    comments: [],
  images: [],
};
