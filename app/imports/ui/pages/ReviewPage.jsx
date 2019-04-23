import {Meteor} from 'meteor/meteor';
import React, {Component} from 'react';
import {Session} from 'meteor/session.js';
import ReactAudioPlayer from 'react-audio-player';
import {toast} from 'react-toastify';
import {Link} from 'react-router-dom';
import _ from 'lodash';

import {Sounds} from '../../api/sounds/sounds.js';
import {Images} from '../../api/images/images.js';
import Waveform from '../components/Waveform.jsx';
import AlertLink from '../components/AlertLink.jsx';
import AppNotification from '../components/AppNotification.jsx';
import BaseComponent from '../components/BaseComponent.jsx';
import CommentList from '../components/CommentList.jsx';
import Input from '../components/Input.jsx';
import ClearingDiv from '../components/ClearingDiv.jsx';
import DragUpload from '../components/DragUpload.jsx';
import SelectUpload from '../components/SelectUpload.jsx';
import TextArea from '../components/TextArea.jsx';
import FileReview from '../components/FileReview.jsx';
import Img from '../components/Image.jsx';
import Message from '../components/Message.jsx';
import Comment from '../components/Comment.jsx';
import {createComment, completeComment} from '../../api/comments/methods.js';

class ReviewTimeMarker extends Component {
  render() {
    const {handleClick, handleOver, handleOut, word} = this.props;
    return (
      <span
        className="time-marker"
        onClick={handleClick}
        onMouseOver={handleOver}
        onMouseOut={handleOut}>
        {word}
      </span>
    );
  }
}

class ReviewPage extends BaseComponent {
  constructor(props) {
    super(props);
    this.inRef = React.createRef();
    this.waveRef = React.createRef();
    this.state = {
      activeSound: null,
      activeComment: null,
      sorter: 'created',
      filter: 'time',
      invert: true,
      filtered: [],
      tags: [],
      bySlide: [],
      byAuth: '',
      byTag: '',
      hoverImage: '',
      activeRegion: [],
      image: '',
    };
  }

  handleKeyPress = e => {
    console.log(e);
  };

  handleLoad = () => {
    const grid = document.getElementById('grid');
    const mason = new Masonry(grid, {
      itemSelector: '.file-item',
    });
    mason.on('layoutComplete', this.handleSelectable);
  };

  handleGenerate = () => {
    const {talk} = this.props;
    console.log('starting generation');
    toast(() => (
      <AppNotification
        msg={'transcript started'}
        desc={'processing discussion audio...'}
        icon={'spinner'}
      />
    ));

    Meteor.call('mergeSounds', talk._id, console.log);
  };

  handleTranscribe = file => {
    const {talk} = this.props;
    console.log('starting transcription');
    console.log(talk._id, file._id);
    Meteor.call('transcribeSounds', talk._id, file._id);
  };

  handleSelectable = items => {
    const area = document.getElementById('grid');
    const elements = items.map(i => i.element);
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
    // set image to link of the first slide
    const {images} = this.props;
    if (images.length > 0) {
      this.updateImage(images[0]._id);
    }

    this.handleLoad();
  };

  componentDidUpdate = () => {
    this.handleLoad();
  };

  setActiveComment = ac => {
    this.setState({activeComment: ac});
  };

  clearActiveComment = () => {
    this.setState({activeComment: ''});
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
    const {ds} = this.state;
    const slideId = e.target.dataset.fileId;
    const newSlide = e.target.innerText.trim();
    const filtered = [{slideNo: newSlide, slideId}];
    this.setState({bySlide: [newSlide], filtered});
    const slide = document.querySelectorAll(`[data-iter='${newSlide}']`);
    if (ds) {
      const sel = ds.getSelection();
      ds.removeSelection(sel);
      ds.addSelection(slide);
    }
  };

  clearBySlide = () => {
    // clearing internal grid
    const {ds} = this.state;
    if (ds) {
      const sel = ds.getSelection();
      ds.removeSelection(sel);
    }
    this.setState({filtered: [], bySlide: []});
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
    const link = Images.findOne({_id: fid}).link('original', '//');
    this.setState({image: link});
  };

  updateHoverImage = fid => {
    const link = Images.findOne({_id: fid}).link('original', '//');
    this.setState({hoverImage: link, image: link});
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

  clearButtonBG = e => {
    //console.log(e.target.className);
    const base = e.target.className.split()[0];
    const matches = [/full-/, /row/, /col-/, /review-table/];
    if (matches.some(x => base.match(x))) {
      this.clearBySlide();
      this.clearByTag();
      this.clearByAuth();
    }
  };

  clearGrid = e => {
    e.preventDefault();
    if (e.target === e.currentTarget) {
      this.clearBySlide();
    }
  };

  renderSlideTags = (filtered, done: false) => {
    const {bySlide} = this.state;
    const active = sn => (bySlide.includes(sn) ? 'active' : '');
    if (filtered.length === 0) {
      return null;
    } else {
      const plural = filtered.length > 1;
      const slideNos = _.sortBy(filtered, x => Number(x.slideNo));
      const slideKeys = slideNos.map(s => (
        <kbd
          className={active(s.slideNo)}
          key={`key-${s.slideNo}`}
          iter={s.slideNo}
          data-file-id={s.slideId}
          onMouseOver={this.handleSlideIn}
          onMouseOut={this.handleSlideOut}
          onClick={this.setBySlide}>
          {s.slideNo}
        </kbd>
      ));
      return (
        <span className="slide-tags">
          <span>{slideKeys}</span>
        </span>
      );
    }
  };

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

  renderImages = () => {
    const {images, comments} = this.props;
    return images.map((f, key) => {
      let link = Images.findOne({_id: f._id}).link('original', '//');
      let count = comments.filter(c => {
        // speed up by not computing this in a loop, precompute and index.
        const general = [{slideNo: 'general'}];
        const slides = c.slides.length > 0 ? c.slides : general;
        const slideNos = slides.map(x => x.slideNo);
        return slideNos.includes((key + 1).toString());
      }).length;

      return (
        <FileReview
          key={'file-' + key}
          iter={key + 1}
          fileUrl={link}
          fileId={f._id}
          fileName={f.name}
          active={false}
          slideCount={count}
          handleLoad={this.handleLoad}
        />
      );
    });
  };

  renderFilter = () => {
    let {comments} = this.props;
    let {byAuth, bySlide, byTag, filtered} = this.state;
    const slideKeys = this.renderSlideTags(filtered);
    const sType = bySlide === ['general'] ? 'scope' : 'slide';
    return (
      <div className="filterer alert no-submit border-bottom">
        <ClearingDiv set={byTag} pre="tag" clear={this.clearByTag} />
        <ClearingDiv set={byAuth} pre="author" clear={this.clearByAuth} />
        <ClearingDiv set={slideKeys} pre={sType} clear={this.clearBySlide} />
      </div>
    );
  };

  renderGenerate = () => {
    const soundDownload = this.renderSoundDownload();
    return (
      <div>
        <AlertLink
          handleClick={this.handleGenerate}
          text={'generate transcript'}
          center={true}
        />
        {soundDownload}
      </div>
    );
  };

  renderComments = () => {
    const {sorter, invert, activeComment, byAuth, bySlide, byTag} = this.state;
    const {comments, reviewer, setModal, clearModal} = this.props;
    if (!comments || !comments.length) {
      return <div className="alert"> no comments yet</div>;
    } else {
      let csort = _.orderBy(
        comments,
        [sorter, 'created'],
        [invert ? 'desc' : 'asc', 'asc'],
      );

      // Filtering 'reply' comments into array.
      // TODO - make it so this seperates on punctuation
      const reply = /\[.*\]\(\s?#c(.*?)\)/;
      const isReply = c => reply.test(c.content);
      const replies = _.orderBy(
        csort.filter(isReply).map(c => {
          const match = reply.exec(c.content);
          c.replyTo = match[1].trim();
          c.isReply = true;
          return c;
        }),
        ['created'],
        ['asc'],
      );

      // remove child comments.
      csort = csort.filter(c => !isReply(c));

      if (byAuth) {
        csort = csort.filter(c => c.author === byAuth);
      }

      if (bySlide.length > 0) {
        csort = csort.filter(c => {
          const general = [{slideNo: 'general'}];
          const slides = c.slides.length > 0 ? c.slides : general;
          const slideNos = slides.map(x => x.slideNo);
          return bySlide.some(sn => slideNos.includes(sn));
        });
      }

      if (byTag) {
        csort = csort.filter(c => c.content.includes(byTag));
      }

      const items = csort.map((c, i) => {
        c.transcript = c.author === 'transcript';
        c.last = i === csort.length - 1; // no final hr
        c.active = c._id === activeComment; // highlight
        c.replies = replies.filter(r => r.replyTo == c._id);
        const context = this.renderSlideTags(c.slides, true);
        return {
          ...c,
          key: c._id,
          reviewView: true,
          context,
          reviewer,
          setModal,
          clearModal,
          log: this.log,
          allReplies: replies,
          commentRef: this.inRef,
          setBySlide: this.setBySlide,
          handleTag: this.setByTag,
          handleAuthor: this.setByAuth,
          handleSlideIn: this.handleSlideIn,
          handleSlideOut: this.handleSlideOut,
          setActive: this.setActiveComment,
          unsetActive: this.clearActiveComment,
        };
      });

      const completed = items.filter(c => c.completed);
      const incomplete = items.filter(c => !c.completed);

      return items.length > 0 ? (
        <div>
          <CommentList title={'to address'} items={incomplete} />
          <CommentList title={'addressed'} items={completed} />
        </div>
      ) : (
        <div className="alert"> no matching comments</div>
      );
    }
  };

  humanFileSize = size => {
    let i = Math.floor(Math.log(1.0 * size) / Math.log(1024));
    return (
      (size / Math.pow(1024, i)).toFixed(2) * 1 +
      ' ' +
      ['B', 'kB', 'MB', 'GB', 'TB'][i]
    );
  };

  humanDate = msTime => {
    const ndate = new Date(msTime);
    return ndate.toLocaleString();
  };

  renderContext = () => {
    const fileList = this.renderImages();

    const {image, hoverImage, filtered} = this.state;
    const {talk, name, sounds} = this.props;
    const imgSrc = hoverImage ? hoverImage : image;

    let snd;
    const [newSound] = sounds; // sorted, first
    if (newSound && WaveSurfer) {
      snd = Sounds.findOne({_id: newSound._id});
    }

    return (
      <div className="context-filter">
        <div id="grid-holder float-at-top">
          <div id="grid" onMouseDown={this.clearGrid}>
            <div className="v-pad" />
            {fileList}
            <div className="v-pad" />
          </div>
        </div>

        <div className="btns-menu-space">
          <button
            onClick={() => this.redirectTo(`/talk/${talk._id}`)}
            className="btn btn-menu btn-note">
            ‹ {name}
          </button>
          {snd && (
            <button
              className="btn btn-menu btn-empty"
              onClick={this.handleExtra}>
              more
            </button>
          )}
        </div>
      </div>
    );
  };

  renderSoundDownload = () => {
    const {sounds, talk} = this.props;
    const [newSound] = sounds; // sorted, first
    if (!newSound || !WaveSurfer) return;
    const snd = Sounds.findOne({_id: newSound._id});
    if (!snd) return;
    const src = snd.link('original', '//');
    const created = this.humanDate(newSound.meta.created);
    const size = this.humanFileSize(newSound.size);
    const name = `${talk.name}-discussion`;
    if (!src) return;
    return (
      <a download={name} href={src} className="link-alert">
        <div className="alert">
          download audio
          <small className="pull-right">
            generated: {created} | {size}
          </small>
        </div>
      </a>
    );
  };

  setDuration = dur => {
    this.setState({duration: dur * 1000.0});
  };

  renderSounds = () => {
    const {activeRegion} = this.state;
    const {sounds} = this.props;
    const [newSound] = sounds; // sorted, first
    if (!newSound || !WaveSurfer) return;
    const snd = Sounds.findOne({_id: newSound._id});
    if (!snd) return;
    const src = snd.link('original', '//');
    if (!src) return;
    return (
      <div className="float-at-top">
        <Waveform
          src={src}
          ref={this.waveRef}
          region={activeRegion}
          handleAudioSet={this.setDuration}
        />
      </div>
    );
  };

  playRegionWord = ({startTime}) => {
    return () => {
      this.waveRef.current.playTime(startTime);
    };
  };

  highlightRegionWord = region => {
    return this.handleRegion(
      {
        startTime: region.startTime,
        endTime: Math.max(region.endTime, region.startTime + 3.0),
      },
      true,
    );
  };

  handleRegion = (region, clear = false) => {
    return _.throttle(() => {
      const wave = this.waveRef.current;
      if (!wave) return false;
      if (clear) wave.clearRegions();
      wave.addRegion(region);
    }, 100);
  };

  playRegionComment = region => {
    return () => {
      this.waveRef.current.playTime(region.startTime / 1000.0);
    };
  };

  handleExtra = () => {
    const {setModal, clearModal} = this.props;
    const generate = this.renderGenerate();
    const mContent = generate;

    setModal({
      accept: false,
      deny: clearModal,
      denyText: 'close',
      mtitle: 'More Options',
      mtext: mContent,
      isOpen: true,
    });
  };

  highlightRegionComment = region => {
    return this.handleRegion({
      color: 'rgba(255, 100, 100, 0.25)',
      startTime: region.startTime / 1000.0,
      endTime: region.stopTime / 1000.0,
    });
  };

  clearRegions = () => {
    const wave = this.waveRef.current;
    if (!wave) return false;
    wave.clearRegions();
  };

  renderWordList = (words = []) => {
    return (
      <p>
        {words.map((w, i) => {
          const playWord = this.playRegionWord(w);
          const highlight = this.highlightRegionWord(w);
          return (
            <ReviewTimeMarker
              key={`${w.word}-${i}`}
              handleClick={playWord}
              handleOver={highlight}
              handleOut={this.clearRegions}
              word={w.word}
            />
          );
        })}
      </p>
    );
  };

  renderTranscript = () => {
    const {transcript} = this.props;
    if (!transcript) return;
    const {results, confidence} = transcript;
    if (!results || !confidence) return;
    const wordList = this.renderWordList(results);
    const content = (
      <div className="clearfix comment">
        <small className="note pull-right">
          {(confidence * 100.0).toFixed(1)}% confidence
        </small>
        {wordList}
      </div>
    );

    return (
      <CommentList title={'transcript'} content={content} defaultOpen={false} />
    );
  };

  generateWordList = (region, pad = 200) => {
    const {startTime, stopTime} = region;
    const {transcript} = this.props;
    if (!transcript) return;
    const {results, confidence} = transcript;
    if (!results || !confidence) return;
    return results.filter(word => {
      return (
        word.startTime > (startTime - pad) / 1000 &&
        word.endTime < (stopTime + pad) / 1000
      );
    });
  };

  renderRegions = () => {
    const {duration} = this.state;
    const {talk, regions} = this.props;
    if (!regions || !this.waveRef || !this.waveRef.current) return;
    const wave = this.waveRef.current;
    if (!duration) return;
    const regionComments = regions
      .filter(w => w.startTime < duration && w.stopTime > 0)
      .map((w, i) => {
        const playComment = this.playRegionComment(w);
        const highlight = this.highlightRegionComment(w);
        const words = this.generateWordList(w);
        const commentWords = this.renderWordList(words);
        return {
          ...w,
          last: i + 1 == regions.length,
          handlePlayAudio: playComment,
          handleMouseOut: this.clearRegions,
          handleMouseOver: highlight,
          wordList: commentWords,
          regionView: true,
        };
      });

    return <CommentList title={'discussed comments'} items={regionComments} />;
  };

  render() {
    const {images, sounds} = this.props;
    const trans = this.renderTranscript();
    const regions = this.renderRegions();
    const comments = this.renderComments();
    const context = this.renderContext();
    const filter = this.renderCommentFilter();
    const generate = this.renderGenerate();
    const audio = this.renderSounds();

    let snd;
    const [newSound] = sounds; // sorted, first
    if (newSound && WaveSurfer) {
      snd = Sounds.findOne({_id: newSound._id});
    }

    return images ? (
      this.renderRedirect() || (
        <div
          className="full-container padded"
          onMouseDown={this.clearButtonBG}
          onKeyPress={console.log}>
          {snd && audio}
          <div id="review-view" className="table review-table">
            <div className="row row-eq-height">
              <div className="col-sm-5">
                {context}
                {!snd && generate}
              </div>
              <div className="col-sm-7">
                {filter}
                {regions}
                {comments}
                {trans}
              </div>
            </div>
          </div>
        </div>
      )
    ) : (
      <div>waiting for slides...</div>
    );
  }
}

export default ReviewPage;
