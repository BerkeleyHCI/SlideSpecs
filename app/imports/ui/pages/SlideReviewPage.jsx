import {Meteor} from 'meteor/meteor';
import React, {Component} from 'react';
import {Session} from 'meteor/session.js';
import {withTracker} from 'meteor/react-meteor-data';
import {Link} from 'react-router-dom';
import _ from 'lodash';

import {Files} from '../../api/files/files.js';
import BaseComponent from '../components/BaseComponent.jsx';
import Input from '../components/Input.jsx';
import TextArea from '../components/TextArea.jsx';
import FileReview from '../components/FileReview.jsx';
import Clock from '../components/Clock.jsx';
import Img from '../components/Image.jsx';
import Message from '../components/Message.jsx';
import Comment from '../components/Comment.jsx';
import {createComment} from '../../api/comments/methods.js';
import {Transition} from 'react-spring';

class SlideReviewPage extends BaseComponent {
  constructor(props) {
    super(props);
    this.inRef = React.createRef();
    this.state = {
      redirectTo: null,
      activeComment: null,
      activeSlide: null,
      sorter: 'created',
      filter: 'time',
      invert: true,
      filtered: [],
      selected: [],
      tags: [],
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
        autoScrollSpeed: 5,
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

  componentDidUpdate = () => {
    this.handleLoad();
    this.handleActive();
  };

  componentDidMount = () => {
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
      this.handleActive(); // or active
    }
  };

  componentWillUnmount = () => {
    let {ds} = this.state;
    if (ds && ds.stop) {
      ds.stop(); // no dragging
    }
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

  handleSlide = e => {
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
    const base = e.target.className.split()[0];
    const matches = [/col-/];
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

  addComment = e => {
    const {reviewer, sessionId} = this.props;
    const slides = this.state.filtered;
    const cText = this.inRef.current.value.trim();
    const commentFields = {
      author: reviewer,
      content: cText,
      session: sessionId,
      slides,
    };

    createComment.call(commentFields, (err, res) => {
      if (err) {
        console.error(err);
      } else {
        this.clearButton();
        this.clearText();
      }
    });
  };

  renderSlideTags = (filtered, done: false) => {
    const {bySlide} = this.state;
    const active = sn => (sn === bySlide ? 'active' : '');
    if (filtered.length === 0) {
      return done ? (
        <kbd className={active({slideNo: 'general'})} onClick={this.setBySlide}>
          general
        </kbd>
      ) : null;
    } else {
      const plural = filtered.length > 1;
      const slideNos = _.sortBy(filtered, x => Number(x.slideNo));
      const slideKeys = slideNos.map(s => (
        <kbd
          className={active(s.slideNo)}
          key={`key-${s.slideNo}`}
          iter={s.slideNo}
          data-file-id={s.slideId}
          onMouseOver={this.handleSlide}
          onMouseOut={this.handleSlideOut}
          onClick={this.setBySlide}>
          {s.slideNo}
        </kbd>
      ));
      return (
        <span className="slide-tags">
          {done ? (
            <span>{slideKeys}</span>
          ) : (
            <span>
              <button
                onClick={this.clearButton}
                className="btn btn-menu pull-right">
                clear
              </button>
              attach comment to slide
              {plural && 's'} {slideKeys}
            </span>
          )}
        </span>
      );
    }
  };

  renderCommentFilter = () => {
    const filterer = this.renderFilter();

    const {files} = this.props;
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
          defaultValue="feedback here. enter to submit, shift-enter for multi-lines."
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
          active={activeSlide - 1 == key}
          handleMouse={this.handleSlide}
          handleMouseOut={this.handleSlideOut}
          handleLoad={this.handleLoad}
        />
      );
    });
  };

  renderFilter = () => {
    const submitter = this.renderSubmit();
    const tagList = this.renderTags();
    let {byAuth, bySlide, byTag} = this.state;
    const sType = bySlide === 'general' ? 'scope' : 'slide';
    if (bySlide) bySlide = <kbd>{bySlide}</kbd>;
    const ClearingDiv = ({set, pre, clear}) => {
      return (
        set && (
          <div>
            <hr />
            <p>
              <strong>view {pre}: </strong>
              {set}
              <button onClick={clear} className="btn btn-menu pull-right">
                clear
              </button>
            </p>
          </div>
        )
      );
    };

    return (
      <div className="filterer alert">
        <p>
          <Clock />
          {tagList}
        </p>
        <ClearingDiv set={byTag} pre="tag" clear={this.clearByTag} />
        <ClearingDiv set={byAuth} pre="author" clear={this.clearByAuth} />
        <ClearingDiv set={bySlide} pre={sType} clear={this.clearBySlide} />
        <hr />
        {submitter}
      </div>
    );
  };

  renderTags = () => {
    const {comments} = this.props;
    const getTag = t => t.split(/\s/).filter(t => t[0] == '#' && t.length > 1);
    const alltags = comments.map(c => getTag(c.content));
    const unique = _.uniq(_.flatten(alltags));
    return unique.map(tag => (
      <a onClick={this.insertTag} className="tag-link" key={tag}>
        {tag}
      </a>
    ));
  };

  goToTop = () => {
    const view = document.getElementsByClassName('nav-head');
    if (view[0]) {
      view[0].scrollIntoView();
    }
  };

  // Updating the current slide.
  handleActive = () => {
    let {activeSlide} = this.state;
    const {active, files} = this.props;
    if (active && activeSlide !== active.slideNo) {
      activeSlide = active.slideNo;
      this.setState({activeSlide});
      // assume 1 index, subtract 1
      const fId = files[activeSlide - 1]._id;
      this.updateImage(fId);
    }
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
        const context = this.renderSlideTags(c.slides, true);
        return {
          ...c,
          key: c._id,
          context,
          reviewer,
          setModal,
          clearModal,
          commentRef: this.inRef,
          handleTag: this.setByTag,
          handleAuthor: this.setByAuth,
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
    const {image, hoverImage, filtered} = this.state;

    const fileList = this.renderFiles();
    const context = this.renderSlideTags(filtered);
    const imgSrc = hoverImage ? hoverImage : image;

    return (
      <div className="context-filter float-at-top">
        <Img className="big-slide" source={imgSrc} />
        <div id="grid-holder">
          <div id="grid" onMouseDown={this.clearGrid}>
            {fileList}
          </div>
        </div>
        {filtered.length > 0 && (
          <div className="no-margin clearfix alert">{context}</div>
        )}
      </div>
    );
  };

  // readd and implement search
  //<Input defaultValue="search feedback..." />

  render() {
    const {files, reviewer} = this.props;
    const cmtHead = this.renderCommentFilter();
    const comments = this.renderComments();
    const context = this.renderContext();

    return files ? (
      this.renderRedirect() || (
        <div className="reviewView">
          <h2 className="nav-head clearfix">
            share feedback
            <small
              onClick={this.clearReviewer}
              className="pull-right clear-icon">
              {reviewer}
            </small>
          </h2>

          <div
            id="review-view"
            onMouseDown={this.clearButtonBG}
            className="table">
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

export default SlideReviewPage;
