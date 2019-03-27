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
      recInterval: null,
      recording: false,
      redirectTo: null,
      draftWords: [],
      timeout: 20 * 1000, // testing with lower
      //timeout: 45 * 1000, // ms -> once per minute
      sorter: 'flag',
      filter: 'flag',
      invert: true,
      bySlide: '',
      byAuth: '',
      byTag: '',
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
            googEchoCancellation: 'true',
            googAutoGainControl: 'true',
            googNoiseSuppression: 'true',
            googHighpassFilter: 'true',
          },
          optional: [],
        },
      },
      gotStream,
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
      window.audioContext = null;
      window.audioRecorder = null;
      window.audioRecorder.clear();
      window.setRecording(false);
    }
  };

  componentDidMount = () => {
    this.handleSetupAudio();
    this.updateResponding();
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

    // save the current comment.
    this.handleAudioUpload();

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

  setByAuth = e => {
    const {byAuth} = this.state;
    const newAuth = e.target.getAttribute('data-auth');
    if (newAuth && byAuth === newAuth) {
      this.setState({byAuth: ''});
    } else if (newAuth) {
      this.setState({byAuth: newAuth});
    }
  };

  clearByAuth = () => {
    this.setState({byAuth: ''});
  };

  setBySlide = e => {
    const {bySlide} = this.state;
    const newSlide = e.target.innerText.trim();
    if (newSlide && bySlide === newSlide) {
      this.setState({bySlide: ''});
    } else if (newSlide) {
      this.setState({bySlide: newSlide});
    }
  };

  clearBySlide = () => {
    this.setState({bySlide: ''});
  };

  // click on tag in comment
  setByTag = e => {
    e.preventDefault();
    const {byTag} = this.state;
    const newTag = e.target.innerText.trim();
    if (newTag && byTag === newTag) {
      this.setState({byTag: ''});
    } else if (newTag) {
      this.setState({byTag: newTag});
    }
  };

  clearByTag = () => {
    this.setState({byTag: ''});
  };

  updateImage = fid => {
    const link = Images.findOne({_id: fid}).link('original', '//');
    this.setState({image: link});
  };

  updateHoverImage = link => {
    this.setState({hoverImage: link, image: link});
  };

  handleSlideIn = e => {
    const src = e.target.querySelector('img').src;
    if (src) this.updateHoverImage(src);
  };

  handleSlideOut = e => {
    this.setState({hoverImage: false});
  };

  updateResponding = () => {};

  renderCommentFilter = () => {
    const filterer = this.renderFilter();

    const {images} = this.props;
    const {invert, filter} = this.state;
    const invFn = () => this.setState({invert: !invert});
    const setSort = (s, f) => {
      return () => this.setState({sorter: s, filter: f});
    };

    const timeSort = setSort('created', 'time');
    const authSort = setSort(x => x.author.toLowerCase(), 'auth');
    const agreeSort = setSort(x => (x.agree || []).length, 'agree');
    const flagSort = setSort(x => (x.discuss || []).length, 'flag');
    const slideSort = setSort(
      x => (x.slides[0] ? Number(x.slides[0].slideNo) : Infinity),
      'slide',
    );

    return (
      <div>
        <div className="btn-m-straight btn-m-group btns-group">
          <button
            className={'btn btn-menu' + (filter === 'flag' ? ' active' : '')}
            onClick={flagSort}>
            discuss
          </button>
          <button
            onClick={timeSort}
            className={'btn btn-menu' + (filter === 'time' ? ' active' : '')}>
            time
          </button>
          <button
            className={'btn btn-menu' + (filter === 'slide' ? ' active' : '')}
            onClick={slideSort}>
            slide
          </button>
          <button
            className={'btn btn-menu' + (filter === 'auth' ? ' active' : '')}
            onClick={authSort}>
            auth
          </button>
          <button
            className={'btn btn-menu' + (filter === 'agree' ? ' active' : '')}
            onClick={agreeSort}>
            agree
          </button>
          <button className={'btn btn-menu'} onClick={invFn}>
            {invert ? '▼' : '▲'}
          </button>
        </div>
        {filterer}
      </div>
    );
  };

  renderFiles = () => {
    const {images} = this.props;
    return images.map((f, key) => {
      let link = Images.findOne({_id: f._id}).link('original', '//');
      return (
        <FileReview
          key={'file-' + key}
          iter={key + 1}
          fileUrl={link}
          fileId={f._id}
          fileName={f.name}
          active={false}
          handleMouse={this.handleSlideIn}
          handleMouseOut={this.handleSlideOut}
        />
      );
    });
  };

  renderFilter = () => {
    const submit = this.renderSubmit();

    let {byAuth, bySlide, byTag} = this.state;
    const sType = bySlide === 'general' ? 'scope' : 'slide';
    const {browserSupportsSpeechRecognition} = this.props;
    if (bySlide) bySlide = <kbd>{bySlide}</kbd>;

    return (
      <div className="filterer alert clearfix">
        <ClearingDiv set={byTag} pre="tag" clear={this.clearByTag} />
        <ClearingDiv set={byAuth} pre="author" clear={this.clearByAuth} />
        <ClearingDiv set={bySlide} pre={sType} clear={this.clearBySlide} />
        {submit}
      </div>
    );
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
      log: this.log,
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
    const {sorter, invert, byAuth, bySlide, byTag} = this.state;
    const {talk, comments, reviewer, setModal, clearModal} = this.props;
    if (!comments || !comments.length) {
      return <div className="alert"> no comments yet</div>;
    } else {
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

      // split off 'addressed' comments
      const addressed = csort.filter(c => c.addressed);
      csort = csort.filter(c => !c.addressed);

      // Clean - filter out those without discuss.
      const unmarked = csort.filter(c => c.discuss.length == 0);
      csort = csort.filter(c => c.discuss.length > 0);

      if (byAuth) {
        csort = csort.filter(c => c.author === byAuth);
      }

      if (bySlide) {
        csort = csort.filter(c => {
          const general = [{slideNo: 'general'}];
          const slides = c.slides.length > 0 ? c.slides : general;
          const slideNos = slides.map(x => x.slideNo);
          return slideNos.includes(bySlide);
        });
      }

      if (byTag) {
        csort = csort.filter(c => c.content.includes(byTag));
      }

      const items = csort.map((c, i) =>
        this.renderCommentData(csort, replies, c, i),
      );

      const addressedItems = addressed.map((c, i) =>
        this.renderCommentData(addressed, replies, c, i),
      );

      const unmarkedItems = unmarked.map((c, i) =>
        this.renderCommentData(unmarked, replies, c, i),
      );

      return (
        <div>
          {items.length > 0 && (
            <div id="comments-list" className="alert">
              <span className="list-title">to discuss</span>
              {items.map(i => (
                <Comment feedback={true} {...i} />
              ))}
            </div>
          )}

          {addressedItems.length > 0 && (
            <div id="comments-list" className="alert">
              <span className="list-title">discussed</span>
              {addressedItems.map(i => (
                <Comment feedback={true} {...i} />
              ))}
            </div>
          )}

          {unmarkedItems.length > 0 && (
            <div id="comments-list" className="alert">
              <span className="list-title">unmarked</span>
              {unmarkedItems.map(i => (
                <Comment {...i} />
              ))}
            </div>
          )}
        </div>
      );
    }
  };

  renderMatchComments = () => {
    const {draftWords, sorter, invert, byAuth, bySlide, byTag} = this.state;
    const {talk, comments, reviewer, setModal, clearModal} = this.props;
    if (!comments || !comments.length) {
      return null;
    }

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

    // draft words - check for matching contents.
    if (draftWords) {
      console.log(draftWords);

      csort = csort.filter(c =>
        draftWords.some(dw => c.content.indexOf(dw) >= 0),
      );
    }

    const items = csort.map((c, i) =>
      this.renderCommentData(csort, replies, c, i),
    );

    return (
      <div>
        {items.length > 0 && (
          <div id="comments-list" className="alert">
            <span className="list-title">matched comments</span>
            {items.map(i => (
              <Comment feedback={true} {...i} />
            ))}
          </div>
        )}
      </div>
    );
  };

  handleSearch = () => {
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
  };

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
      },
      //transport: 'http',
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
          this.log({name, size});
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
    const respond = Comments.find({_id: {$in: talk.active}}).fetch();
    if (!respond.length) return null;
    return (
      <div id="comments-list" className="alert">
        <span className="list-title list-title-note">discussing</span>
        {respond.map((i, iter) => (
          <Comment
            {...i}
            key={`discuss-${iter}`}
            iter={iter}
            facilitateView={true}
            responding={true}
          />
        ))}
      </div>
    );
  };

  renderSubmit = () => {
    return (
      <div className="submitter">
        <TextArea
          inRef={this.inRef}
          handleKeyDown={this.handleSearch}
          handleSubmit={this.addComment}
          defaultValue="start a new discussion comment here.."
          className="code comment-text"
        />
      </div>
    );
  };

  // <canvas id="wavedisplay" width="1024" height="500" />

  renderSounds = () => {
    const {recording} = this.state;
    const classRecord = recording ? 'recording' : 'waiting';
    return (
      <div id="sound" className="clearfix">
        <div id="record" className={classRecord} onClick={this.toggleRecording}>
          <img src="/img/mic128.png" />
        </div>
        <canvas id="analyser" width="1024" height="500" />
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
      toast(() => (
        <AppNotification
          msg={'mic off'}
          desc={'Recording off.'}
          icon={'times'}
        />
      ));
    }
  };

  // blob/fle conversion
  // https://stackoverflow.com/questions/27159179/
  //blob.lastModified = lastModified;
  //blob.name = name;
  //blob.type = type;

  blobToFile = blob => {
    const {talk} = this.props;
    const lastModified = Date.now();
    const name = `${talk.name} ${lastModified}.wav`;
    const type = 'audio/wav';
    return new File([blob], name, {lastModified, type});
  };

  handleAudioUpload = () => {
    if (window.audioRecorder) {
      //window.audioRecorder.exportWAV(this.handleUpload);
      window.audioRecorder.exportMonoWAV(this.handleUpload);
    } else {
      console.error('cant access audio recorder!');
    }
  };

  render() {
    const {images} = this.props;
    const context = this.renderSounds();
    const matched = this.renderMatchComments();
    const respond = this.renderRespond();
    const comments = this.renderComments();
    const cmtHead = this.renderCommentFilter();

    return images ? (
      this.renderRedirect() || (
        <div className="main-content">
          <div className="facilitateView">
            <div id="review-view" className="table review-table">
              <div className="row">
                <div className="col-sm-5 full-height-md no-float">
                  <div className="float-at-top">
                    {context}
                    {cmtHead}
                    {matched}
                  </div>
                </div>
                <div className="col-sm-7">
                  {respond}
                  {comments}
                </div>
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
