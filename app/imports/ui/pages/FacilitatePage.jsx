import {Meteor} from 'meteor/meteor';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {Session} from 'meteor/session.js';
import {Link} from 'react-router-dom';
import {toast} from 'react-toastify';
import _ from 'lodash';

import {Sounds} from '../../api/sounds/sounds.js';
import {Images} from '../../api/images/images.js';
import BaseComponent from '../components/BaseComponent.jsx';
import AlertLink from '../components/AlertLink.jsx';
import CommentList from '../components/CommentList.jsx';
import AppNotification from '../components/AppNotification.jsx';
import SpeechRecognition from 'react-speech-recognition';
import Input from '../components/Input.jsx';
import TextArea from '../components/TextArea.jsx';
import SlideTags from '../components/SlideTags.jsx';
import ClearingDiv from '../components/ClearingDiv.jsx';
import FileReview from '../components/FileReview.jsx';
import Clock from '../components/Clock.jsx';
import Img from '../components/Image.jsx';
import Message from '../components/Message.jsx';
import Comment from '../components/Comment.jsx';
import {Comments} from '../../api/comments/comments.js';
import {createComment, addressComment} from '../../api/comments/methods.js';
import {setRespondingComment} from '../../api/talks/methods.js';

class FacilitatePage extends BaseComponent {
  constructor(props) {
    super(props);
    this.inRef = React.createRef();
    this.state = {
      redirectTo: null,
      recInterval: null,
      recording: false,
      draftWords: [],
      timeout: 60 * 1000, // ms -> once per minute
    };
  }

  handleSetupAudio = () => {
    if (!navigator.getUserMedia)
      navigator.getUserMedia =
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.mediaDevices.getUserMedia;
    if (!navigator.cancelAnimationFrame)
      navigator.cancelAnimationFrame =
        navigator.webkitCancelAnimationFrame ||
        navigator.mozCancelAnimationFrame;
    if (!navigator.requestAnimationFrame)
      navigator.requestAnimationFrame =
        navigator.webkitRequestAnimationFrame ||
        navigator.mozRequestAnimationFrame;

    navigator.getUserMedia(
      {
        audio: {
          mandatory: {
            googEchoCancellation: 'false',
            googAutoGainControl: 'false',
            googNoiseSuppression: 'false',
            googHighpassFilter: 'false',
          },
          optional: [],
        },
      },
      gotStream, // global worker handler
      function(e) {
        alert('Error getting audio');
        console.log(e);
      },
    );

    window.audioContext = new AudioContext();
  };

  handleTeardownAudio = () => {
    if (audioRecorder && audioContext) {
      console.log('ending audio services.');
      window.setRecording(false);
      window.audioRecorder.clear();
      window.audioRecorder = null;
      window.audioContext = null;
    }
  };

  componentDidMount = () => {
    this.handleSetupAudio();
  };

  componentWillUnmount = () => {
    this.handleTeardownAudio();
  };

  addComment = () => {
    const {talk} = this.props;
    const cText = this.inRef.current.value.trim();
    const priv = cText.includes('#private');
    const commentFields = {
      author: 'audience',
      content: cText,
      talk: talk._id,
      discuss: ['audience'],
      userOwn: false,
      slides: [],
    };

    createComment.call(commentFields, (err, res) => {
      if (err) {
        console.error(err);
      } else {
        this.clearText();
        this.clearMatch();
        setRespondingComment.call({talkId: talk._id, commentId: res});
      }
    });
  };

  clearMatch = () => {
    this.setState({draftWords: []});
  };

  clearText = () => {
    const textarea = this.inRef.current;
    textarea.value = '';
    textarea.focus();
  };

  renderFilter = () => {
    const submit = this.renderSubmit();
    return <div className="filterer clearfix">{submit}</div>;
  };

  generateCommentData = () => {
    const {talk, comments, reviewer, setModal, clearModal} = this.props;
    let csort = _.orderBy(comments, ['created'], ['asc']);

    // Filter out transcript comments.
    csort = csort.filter(c => c.author != 'transcript');

    // Filtering 'reply' comments into array.
    const reply = /\[.*\]\(\s?#c(.*?)\)/;
    const isReply = c => reply.test(c.content);
    const replies = csort.filter(isReply).map(c => {
      const match = reply.exec(c.content);
      c.replyTo = match[1].trim();
      c.isReply = true;
      return c;
    });

    // remove child comments.
    csort = csort.filter(c => !isReply(c));
    return {csort, replies};
  };

  renderCommentData = (arr, replies, c, i) => {
    const {sessionId, comments, reviewer, setModal, clearModal} = this.props;
    const {sorter, invert, byAuth, bySlide, byTag} = this.state;
    c.last = i === arr.length - 1; // no final hr
    c.replies = replies.filter(r => r.replyTo == c._id);
    return {
      ...c,
      key: c._id,
      reviewer,
      setModal,
      clearModal,
      sessionId,
      facilitateView: true,
      allReplies: replies,
      commentRef: this.inRef,
      handleTag: this.setByTag,
      handleAuthor: this.setByAuth,
      bySlide: bySlide,
      handleSlideIn: this.handleTagIn,
      handleSlideOut: this.handleSlideOut,
      clearButton: this.clearButton,
      clearBySlide: this.clearBySlide,
      setBySlide: this.setBySlide,
    };
  };

  renderComments = () => {
    const {talk, comments, reviewer, setModal, clearModal} = this.props;
    if (!comments || !comments.length) {
      return <div className="alert"> no comments yet</div>;
    } else {
      let {csort, replies} = this.generateCommentData();

      // Clean - filter out active responding comments.
      csort = csort.filter(c => talk.active.indexOf(c._id) < 0);

      // split off 'addressed' comments
      const addressed = csort.filter(c => c.addressed);
      csort = csort.filter(c => !c.addressed);

      // Clean - filter out those without discuss.
      const unmarked = csort.filter(c => c.discuss.length == 0);
      csort = csort.filter(c => c.discuss.length > 0);

      const items = csort.map((c, i) =>
        this.renderCommentData(csort, replies, c, i),
      );

      const addrItems = addressed.map((c, i) =>
        this.renderCommentData(addressed, replies, c, i),
      );

      const unmarkedItems = unmarked.map((c, i) =>
        this.renderCommentData(unmarked, replies, c, i),
      );

      return (
        <div>
          <CommentList title={'to discuss'} items={items} feedback={true} />
          <CommentList title={'discussed'} items={addrItems} feedback={true} />
          <CommentList title={'unmarked'} items={unmarkedItems} />
        </div>
      );
    }
  };

  renderMatchComments = () => {
    const {draftWords, sorter, invert, byAuth, bySlide, byTag} = this.state;
    const {talk, comments, reviewer, setModal, clearModal} = this.props;
    if (!draftWords || !comments || !comments.length) return null;

    let csort = _.orderBy(
      comments,
      [sorter, 'created'],
      [invert ? 'desc' : 'asc', 'asc'],
    );

    // Clean - filter out active responding comments.
    csort = csort.filter(c => talk.active.indexOf(c._id) < 0);

    // Filter out transcript comments.
    csort = csort.filter(c => c.author != 'transcript');

    // Filtering 'reply' comments into array.
    const reply = /\[.*\]\(\s?#c(.*?)\)/;
    const isReply = c => reply.test(c.content);
    const replies = csort.filter(isReply).map(c => {
      const match = reply.exec(c.content);
      c.replyTo = match[1].trim();
      c.isReply = true;
      return c;
    });

    // remove child comments.
    csort = csort.filter(c => !isReply(c));

    // string match
    const draftMatch = (s, dws) =>
      dws.some(dw => s.toLowerCase().includes(dw.toLowerCase()));

    // comment match with replies
    const commentMatch = (c, dws) => {
      c.replies = c.replies || [];
      return (
        draftMatch(c.content, dws) ||
        draftMatch(c.author, dws) ||
        c.replies.some(c => commentMatch(c, dws))
      );
    };

    // draft words - check for matching contents.
    csort = csort.filter(c => commentMatch(c, draftWords));

    const items = csort.map((c, i) =>
      this.renderCommentData(csort, replies, c, i),
    );

    return (
      <CommentList title={'matched comments'} items={items} feedback={true} />
    );
  };

  handleSearch = _.debounce(() => {
    const text = this.inRef.current.value.trim();
    if (!text) {
      this.setState({draftWords: []});
    } else {
      const words = text
        .trim()
        .split(/\s/)
        .map(s => s.trim())
        .filter(s => s.length > 0);
      this.setState({draftWords: words});
    }
  }, 150); // wait for delay after keypress.

  handleUpload = blob => {
    window.audioRecorder.clear();
    let {talk} = this.props;
    const handleToast = ({msg, desc, icon, closeTime}) => {
      if (!closeTime) closeTime = 4000;
      toast(() => <AppNotification msg={msg} desc={desc} icon={icon} />, {
        autoClose: closeTime,
      });
    };

    // Allow uploading files under 50MB for now.
    const goodSize = blob.size <= 50985760 && blob.size > 4096;
    if (!goodSize) {
      return; // skip this file.
    }

    let file = this.blobToFile(blob);
    let soundArgs = {
      file,
      meta: {
        created: Date.now(),
        userId: Meteor.userId(),
        talkId: talk._id,
        target: talk.active || '',
        complete: false,
      },
      streams: 'dynamic',
      chunkSize: 'dynamic',
      allowWebWorkers: true,
    };

    // dont autostart the upload
    console.log(soundArgs.meta);
    let uploadInstance = Sounds.insert(soundArgs, false);

    uploadInstance.on('start', (err, file) => {
      console.log('started', file.name);
    });

    uploadInstance.on('end', (err, file) => {
      if (!err) {
        {
          const {name, size} = file;
          console.log('upload complete', file.name);
          //this.log({name, size});
        }
      } else {
        console.error(err);
      }
    });

    uploadInstance.on('error', (err, file) => {
      if (err) console.error(err, file);
    });

    uploadInstance.start();
  };

  clearRespond = () => {
    const {talk} = this.props;
    setRespondingComment.call({talkId: talk._id, commentId: ''});
  };

  renderRespond = () => {
    const {talk} = this.props;
    let activeFix = _.flatten([talk.active]);
    const {csort, replies} = this.generateCommentData();
    const trimmed = csort.filter(c => activeFix.includes(c._id));
    const respond = trimmed.map((c, i) =>
      this.renderCommentData(trimmed, replies, c, i),
    );

    return (
      <CommentList
        title={'discussing'}
        items={respond}
        facilitateView={true}
        responding={true}
        note={true}
      />
    );
  };

  renderSubmit = () => {
    return (
      <div className="submitter">
        <TextArea
          inRef={this.inRef}
          handleKeyDown={this.handleSearch}
          handleKeyUp={this.handleSearch}
          handleSubmit={this.addComment}
          defaultValue="start a new discussion comment here"
          className="code comment-text"
        />
      </div>
    );
  };

  renderSounds = () => {
    const {recording} = this.state;
    const classRecord = recording ? 'recording' : 'waiting';
    return (
      <div id="sound" className="clearfix">
        <div id="record" className={classRecord} onClick={this.toggleRecording}>
          {recording ? (
            <i className="fa fa-stop" />
          ) : (
            <i className="fa fa-microphone" />
          )}
        </div>
        <canvas id="analyser" width="1024" height="400" />
      </div>
    );
  };

  toggleRecording = () => {
    if (!window.audioContext) {
      this.handleSetupAudio();
    }

    const {recording, recInterval, timeout} = this.state;
    const newRecord = !recording;
    window.setRecording(newRecord);
    this.setState({recording: newRecord});
    this.log({type: 'record', recording: newRecord});

    let msg;
    if (newRecord) {
      const newInterval = setInterval(this.handleAudioUpload, timeout);
      this.setState({recInterval: newInterval});
      toast(() => (
        <AppNotification
          msg={'mic on'}
          desc={'Recording on.'}
          icon={'microphone'}
        />
      ));
    } else if (recInterval) {
      clearInterval(recInterval);
      this.setState({recInterval: null});
      this.handleAudioUpload(); // get remaining audio from buffer.
      toast(() => (
        <AppNotification
          msg={'mic off'}
          desc={'Recording off.'}
          icon={'times'}
        />
      ));
    }
  };

  blobToFile = blob => {
    const {talk} = this.props;
    const lastModified = Date.now();
    const name = `${talk.name} ${lastModified}.wav`;
    const type = 'audio/wav';
    return new File([blob], name, {lastModified, type});
  };

  handleAudioUpload = () => {
    if (window.audioRecorder) {
      window.audioRecorder.exportMonoWAV(this.handleUpload);
      //window.audioRecorder.exportWAV(this.handleUpload);
    } else {
      console.error('cant access audio recorder!');
      toast(() => (
        <AppNotification
          msg={'Mic error'}
          desc={'Error accessing audio input.'}
          icon={'times'}
        />
      ));
    }
  };

  render() {
    const {images} = this.props;
    const sounds = this.renderSounds();
    const matched = this.renderMatchComments();
    const respond = this.renderRespond();
    const comments = this.renderComments();
    const submit = this.renderFilter();

    return images ? (
      this.renderRedirect() || (
        <div className="main-content">
          <div className="facilitateView">
            <div id="review-view" className="table review-table">
              <div className="row row-eq-height">
                <div className="col-sm-5 no-float">
                  <div className="float-at-top white-background">
                    {sounds}
                    {submit}
                    {respond}
                  </div>
                  {matched}
                </div>
                <div className="col-sm-7">{comments}</div>
              </div>
            </div>
          </div>
        </div>
      )
    ) : (
      <div>waiting for slides</div>
    );
  }
}

export default FacilitatePage;
