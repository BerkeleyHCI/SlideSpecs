import {Meteor} from 'meteor/meteor';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {Session} from 'meteor/session.js';
import {withTracker} from 'meteor/react-meteor-data';
import {Link} from 'react-router-dom';
import {toast} from 'react-toastify';
import _ from 'lodash';

import {Files} from '../../api/files/files.js';
import BaseComponent from '../components/BaseComponent.jsx';
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
import {createComment} from '../../api/comments/methods.js';
import {Transition} from 'react-spring';

// Control-log.
import {Logger} from 'meteor/ostrio:logger';
import {LoggerConsole} from 'meteor/ostrio:loggerconsole';

class DiscussPage extends BaseComponent {
  constructor(props) {
    super(props);

    // Control-log.
    this.logger = new Logger();
    new LoggerConsole(this.logger).enable();

    this.inRef = React.createRef();
    this.state = {
      control: false,
      redirectTo: null,
      activeComment: null,
      activeSlide: null,
      revising: false,
      sorter: 'flag',
      filter: 'flag',
      invert: true,
      filtered: [],
      selected: [],
      tags: [],
      author: null,
      bySlide: '',
      byAuth: '',
      byTag: '',
      hoverImage: '',
      image: '',
      ds: {},
    };
  }

  handleLoad = () => {
    const grid = document.getElementById('grid');
    const mason = new Masonry(grid, {
      itemSelector: '.file-item',
    });
    mason.on('layoutComplete', this.handleSelectable);
  };

  log = data => {
    //console.log(data);
    const {reviewer, sessionId} = this.props;
    if (typeof data === 'string') {
      this.logger.info(
        JSON.stringify({data, reviewer, sessionId, time: Date.now()}),
      );
    } else if (Object.keys.length > 0) {
      this.logger.info(
        JSON.stringify({...data, reviewer, sessionId, time: Date.now()}),
      );
    } else {
      this.logger.info(
        JSON.stringify({data, reviewer, sessionId, time: Date.now()}),
      );
    }
  };

  handleSelectable = items => {
    const area = document.getElementById('grid');
    const elements = items.map(i => i.element);
    let {ds, selected} = this.state;
    const updateSelection = () => {
      const s = ds.getSelection();
      if (s.length > 0) {
        const filtered = s.map(this.extractFileData);
        this.setState({selected: s, filtered});
      }
    };

    if (!_.isEmpty(ds)) {
      ds.selectables = elements;
    } else {
      ds = new DragSelect({
        selectables: elements,
        onDragMove: updateSelection,
        callback: updateSelection,
        autoScrollSpeed: 12,
        area: area,
      });
      this.setState({ds});
    }
  };

  elementize = x => {
    return {element: x};
  };

  extractFileData = x => {
    return {
      slideId: x.getAttribute('data-file-id'),
      slideNo: x.getAttribute('data-iter'),
    };
  };

  componentDidMount = () => {
    // handle voice integration
    const {browserSupportsSpeechRecognition} = this.props;
    if (!browserSupportsSpeechRecognition) {
      toast(() => (
        <AppNotification
          msg="VOICE ERROR"
          desc="Dictation only supported in Google Chrome 27+"
          icon="error"
        />
      ));
    }

    this.handleLoad();

    setTimeout(() => {
      const items = document.querySelectorAll('.file-item');
      const nodes = Array.prototype.slice.call(items).map(this.elementize);
      this.handleSelectable(nodes);
    }, 500);

    // set image to link of the first slide
    const {files} = this.props;
    if (files.length > 0) {
      this.updateImage(files[0]._id);
    }
  };

  componentDidUpdate = () => {
    this.handleLoad();
  };

  componentWillUnmount = () => {
    let {ds} = this.state;
    if (ds && ds.stop) {
      ds.stop(); // no drag
    }
  };

  setActiveComment = ac => {
    this.setState({activeComment: ac});
  };

  clearActiveComment = () => {
    this.setState({activeComment: ''});
  };

  setDiscussAuth = author => {
    this.setState({author});
  };

  clearDiscussAuth = () => {
    this.setState({author: null});
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

  // click on tag in filter
  insertTag = e => {
    e.preventDefault();
    const tag = e.target.innerText.trim();
    const textarea = this.inRef.current;
    if (textarea.value === '') {
      textarea.value = `${tag} `;
    } else if (!textarea.value.includes(tag)) {
      textarea.value += ` ${tag} `;
    }
    textarea.focus();
  };

  clearByTag = () => {
    this.setState({byTag: ''});
  };

  clearReviewer = () => {
    localStorage.setItem('feedbacks.reviewer', null);
    Session.set('reviewer', null);
  };

  updateImage = fid => {
    const link = Files.findOne({_id: fid}).link('original', '//');
    this.setState({image: link});
  };

  updateHoverImage = fid => {
    const {activeSlide} = this.state;
    const link = Files.findOne({_id: fid}).link('original', '//');
    this.setState({hoverImage: link});
    if (!activeSlide) {
      this.setState({image: link});
    }
  };

  handleSlideIn = e => {
    if (e.target === e.currentTarget) {
      const data = this.extractFileData(e.target);
      this.updateHoverImage(data.slideId);
    }
  };

  handleSlideOut = e => {
    this.setState({hoverImage: false});
  };

  clearText = () => {
    const textarea = this.inRef.current;
    textarea.value = '';
    textarea.focus();
  };

  clearSelection = e => {
    this.setState({filtered: [], selected: []});
  };

  clearButtonBG = e => {
    this.clearActiveComment();
    const base = e.target.className.split()[0];
    const matches = [/col-/, /review-table/];
    if (matches.some(x => base.match(x))) {
      this.clearButton();
    }
  };

  clearButton = e => {
    this.clearSelection();
    const {ds} = this.state;
    if (ds) {
      // clearing internal grid
      const sel = ds.getSelection();
      ds.removeSelection(sel);
    }
  };

  clearGrid = e => {
    e.preventDefault();
    if (e.target === e.currentTarget) {
      this.clearSelection();
    }
  };

  addComment = () => {
    const {author, control} = this.state;
    const {reviewer, sessionId} = this.props;
    const slides = this.state.filtered;
    const cText = this.inRef.current.value.trim();
    const commentFields = {
      content: cText,
      session: sessionId,
      discuss: ['system'],
      userOwn: control,
      author,
      slides,
    };

    createComment.call(commentFields, (err, res) => {
      if (err) {
        console.error(err);
      } else {
        this.endTranscript();
        this.clearButton();
        this.clearText();
      }
    });
  };

  renderCommentFilter = () => {
    const filterer = this.renderFilter();

    const {files} = this.props;
    const {control, invert, filter} = this.state;
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
      <div className="float-at-top">
        <div className="btn-m-group btns-group">
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
          <button
            className={'btn btn-menu' + (filter === 'flag' ? ' active' : '')}
            onClick={flagSort}>
            discuss
          </button>
          <button className={'btn btn-menu'} onClick={invFn}>
            {invert ? '▼' : '▲'}
          </button>
        </div>
        {filterer}
      </div>
    );
  };

  renderSubmit = () => {
    return (
      <div className="submitter">
        <TextArea
          inRef={this.inRef}
          handleSubmit={this.addComment}
          defaultValue="enter discussion here."
          className="code comment-text"
        />
      </div>
    );
  };

  renderFiles = () => {
    const {files} = this.props;
    const {activeSlide} = this.state;
    return files.map((f, key) => {
      let link = Files.findOne({_id: f._id}).link('original', '//');
      return (
        <FileReview
          key={'file-' + key}
          iter={key + 1}
          fileUrl={link}
          fileId={f._id}
          fileName={f.name}
          active={false}
          handleMouse={this.handleSlide}
          handleMouseOut={this.handleSlideOut}
          handleLoad={this.handleLoad}
        />
      );
    });
  };

  renderFilter = () => {
    const tagList = this.renderTags();
    const voice = this.renderVoice();
    let {control, byAuth, bySlide, byTag} = this.state;
    const sType = bySlide === 'general' ? 'scope' : 'slide';
    const {browserSupportsSpeechRecognition} = this.props;
    if (bySlide) bySlide = <kbd>{bySlide}</kbd>;

    return (
      <div className="filterer alert clearfix">
        <p>
          <Clock />
          {tagList}
        </p>
        <ClearingDiv set={byTag} pre="tag" clear={this.clearByTag} />
        <ClearingDiv set={byAuth} pre="author" clear={this.clearByAuth} />
        <ClearingDiv set={bySlide} pre={sType} clear={this.clearBySlide} />
        <hr />
        {browserSupportsSpeechRecognition ? voice : this.renderSubmit()}
      </div>
    );
  };

  renderTags = () => {
    const {comments} = this.props;
    const getTag = t => t.split(/\s/).filter(t => t[0] == '#' && t.length > 1);
    const alltags = comments.map(c => getTag(c.content));
    const unique = _.uniq(_.flatten(alltags));
    return unique.map(tag => (
      <span key={tag} className="tag-group">
        <a onClick={this.setByTag} className="tag-link">
          {tag}
        </a>
      </span>
    ));
  };

  renderAuthors = () => {
    const {author} = this.state;
    const {sComments} = this.props;
    const allAuth = sComments.map(c => c.author);
    const unique = _.uniq(_.flatten(allAuth));
    return unique.sort().map(a => (
      <span
        key={a}
        className={'tag-group' + (author == a ? ' auth-active' : '')}>
        <a onClick={() => this.setDiscussAuth(a)} className="tag-link">
          {a}
        </a>
      </span>
    ));
  };

  goToTop = () => {
    const view = document.getElementsByClassName('nav-head');
    if (view[0]) {
      view[0].scrollIntoView();
    }
  };

  renderComments = () => {
    const {
      sorter,
      invert,
      filtered,
      activeComment,
      byAuth,
      bySlide,
      byTag,
      control,
    } = this.state;
    const {sComments, reviewer, setModal, clearModal} = this.props;
    if (!sComments || !sComments.length) {
      return <div className="alert"> no comments yet</div>;
    } else {
      let csort = _.orderBy(
        sComments,
        [sorter, 'created'],
        [invert ? 'desc' : 'asc', 'asc'],
      );

      // Clean - filter out those without discuss.
      csort = csort.filter(c => c.discuss.length > 0);

      // Filtering 'reply' comments into array. HATE.
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

      const items = csort.map((c, i) => {
        c.last = i === csort.length - 1; // no final hr
        c.active = c._id === activeComment; // highlight
        c.replies = replies.filter(r => r.replyTo == c._id);
        return {
          ...c,
          key: c._id,
          reviewer,
          setModal,
          clearModal,
          activeComment,
          log: this.log,
          feedback: true,
          allReplies: replies,
          commentRef: this.inRef,
          handleTag: this.setByTag,
          handleAuthor: this.setByAuth,
          bySlide: bySlide,
          handleSlideIn: this.handleSlideIn,
          handleSlideOut: this.handleSlideOut,
          clearButton: this.clearButton,
          clearBySlide: this.clearBySlide,
          setBySlide: this.setBySlide,
          setActive: this.setActiveComment,
          unsetActive: this.clearActiveComment,
        };
      });

      return (
        <div>
          <div id="comments-list" className="alert">
            {items.map(i => (
              <Comment {...i} />
            ))}
          </div>
          {items.length >= 5 && (
            <div className="padded full-width">
              <button
                onClick={this.goToTop}
                className="btn center btn-menu btn-round">
                <i className={'fa fa-arrow-up'} />
              </button>
              <div className="v-pad" />
            </div>
          )}
        </div>
      );
    }
  };

  renderContext = () => {
    const fileList = this.renderFiles();
    const {image, hoverImage, filtered, bySlide} = this.state;
    const imgSrc = hoverImage ? hoverImage : image;

    return (
      <div className="context-filter float-at-top">
        <Img className="big-slide" source={imgSrc} />
        <div id="grid-holder">
          <div id="grid" onMouseDown={this.clearGrid}>
            {fileList}
          </div>
        </div>
        <div className="v-pad" />
        <div className="v-pad" />
        {filtered.length > 0 && (
          <div className="no-margin clearfix alert bottom">
            Slides:
            <SlideTags
              done={true}
              slides={filtered}
              bySlide={bySlide}
              handleSlideIn={this.handleSlideIn}
              handleSlideOut={this.handleSlideOut}
              clearButton={this.clearButton}
              clearBySlide={this.clearBySlide}
              setBySlide={this.setBySlide}
            />
          </div>
        )}
      </div>
    );
  };

  renderVoice = () => {
    const submitter = this.renderSubmit();
    const authors = this.renderAuthors();
    const {uTranscript, revising, author} = this.state;
    const {
      transcript,
      listening,
      resetTranscript,
      interimTranscript,
      startListening,
      stopListening,
    } = this.props;

    // initialize the box to value.
    if (
      this.inRef &&
      this.inRef.current &&
      !this.inRef.current.value &&
      uTranscript
    ) {
      this.inRef.current.value = uTranscript;
    }

    return (
      <div>
        {revising ? (
          <div>
            <div className="btn-m-group btns-group">
              <button
                className={'btn ' + (author ? 'btn-primary' : 'btn-disabled')}
                onClick={this.addComment}>
                confirm
              </button>
              <button className="btn btn-empty" onClick={this.resumeTranscript}>
                resume
              </button>
              <button className="btn btn-danger" onClick={this.endTranscript}>
                erase
              </button>
            </div>
            <hr />
            <div className="padded">
              <span className={!author ? 'auth-active' : ''}>
                Speaker (required)
              </span>
              : &nbsp;&nbsp;
              {authors}
            </div>
            {submitter}
          </div>
        ) : (
          <div>
            <div className="btns-group">
              {listening ? (
                <button
                  className={'btn btn-danger btn-listening'}
                  onClick={stopListening}>
                  stop
                </button>
              ) : (
                <button className={'btn btn-primary'} onClick={startListening}>
                  record discussion
                </button>
              )}

              {transcript.length > 0 && (
                <button className="btn btn-empty" onClick={this.prepTranscript}>
                  Save
                </button>
              )}

              {transcript.length > 0 && (
                <button className="btn btn-danger" onClick={resetTranscript}>
                  Erase
                </button>
              )}
            </div>

            {(transcript || listening) && (
              <div>
                <code className="transcript">
                  {transcript}
                  {listening && transcript.length == 0 && <i>*listening*</i>}
                </code>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  prepTranscript = () => {
    const {stopListening, transcript} = this.props;
    const text = '#discussion ' + transcript;
    this.setState({uTranscript: text, revising: true});
    stopListening();
  };

  resumeTranscript = () => {
    const {startListening} = this.props;
    this.setState({revising: false});
    startListening();
  };

  endTranscript = () => {
    const {stopListening, resetTranscript} = this.props;
    this.setState({uTranscript: '', revising: false, author: null});
    resetTranscript();
    stopListening();
  };

  render() {
    const {files, reviewer, sessionId} = this.props;
    const cmtHead = this.renderCommentFilter();
    const comments = this.renderComments();
    const context = this.renderContext();

    return files ? (
      this.renderRedirect() || (
        <div className="reviewView main-content no-pad">
          <h2 className="nav-head clearfix">
            <Link to={`/sessions/${sessionId}`}>
              <span className="black"> ‹ </span>
              discuss feedback
            </Link>
          </h2>

          <div
            id="review-view"
            onMouseDown={this.clearButtonBG}
            className="table review-table">
            <div className="row">
              <div className="col-sm-5 full-height-md no-float">{context}</div>
              <div className="col-sm-7">
                {cmtHead}
                {comments}
              </div>
            </div>
          </div>
        </div>
      )
    ) : (
      <div>loading file list...</div>
    );
  }
}

// Props injected by SpeechRecognition
DiscussPage.propTypes = {
  transcript: PropTypes.string,
  resetTranscript: PropTypes.func,
  browserSupportsSpeechRecognition: PropTypes.bool,
};

export default SpeechRecognition({autoStart: false})(DiscussPage);
