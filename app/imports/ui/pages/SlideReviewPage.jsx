import {Meteor} from 'meteor/meteor';
import React, {Component} from 'react';
import {Session} from 'meteor/session.js';
import {withTracker} from 'meteor/react-meteor-data';
import {Link} from 'react-router-dom';
import _ from 'lodash';

import {Files} from '../../api/files/files.js';
import BaseComponent from '../components/BaseComponent.jsx';
import FileReview from '../components/FileReview.jsx';
import Clock from '../components/Clock.jsx';
import Img from '../components/Image.jsx';
import Message from '../components/Message.jsx';
import Comment from '../components/Comment.jsx';
import {createComment} from '../../api/comments/methods.js';

class SlideReviewPage extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      redirectTo: null,
      sorter: 'created',
      filter: 'time',
      invert: true,
      filtered: [],
      selected: [],
      byAuth: '',
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

  componentDidUpdate = this.handleLoad;
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
      this.updateSlideFile(files[0]._id);
    }
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

  clearReviewer = () => {
    localStorage.setItem('feedbacks.reviewer', null);
    Session.set('reviewer', null);
  };

  updateSlideFile = fid => {
    const link = Files.findOne({_id: fid}).link('original', '//');
    this.setState({image: link});
  };

  handleSlide = e => {
    if (e.target === e.currentTarget) {
      const data = this.extractFileData(e.target);
      this.updateSlideFile(data.slideId);
    }
  };

  getText = () => {
    const copyText = document.getElementsByClassName('code')[0];
    if (copyText) {
      return copyText.value;
    } else {
      return '';
    }
  };

  clearText = () => {
    const copyText = document.getElementsByClassName('code')[0];
    copyText.value = '';
    copyText.focus();
  };

  clearSelection = e => {
    this.setState({filtered: [], selected: []});
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
    const cText = this.getText().trim();
    const commentFields = {
      author: reviewer,
      content: cText,
      session: sessionId,
      slides,
    };

    if (cText && e.keyCode === 13 && !e.shiftKey) {
      createComment.call(commentFields, (err, res) => {
        if (err) {
          console.error(err);
        } else {
          this.clearButton();
          this.clearText();
        }
      });
    }
  };

  renderSlideTags = (filter, done: false) => {
    if (filter.length === 0) {
      return done ? (
        <kbd>general</kbd>
      ) : (
        'no slides selected, attach as general feedback'
      );
    } else {
      const plural = filter.length > 1;
      const slideNos = _.sortBy(filter, x => Number(x.slideNo));
      const slideKeys = slideNos.map(s => (
        <kbd
          key={`key-${s.slideNo}`}
          iter={s.slideNo}
          data-file-id={s.slideId}
          onMouseOver={this.handleSlide}>
          {s.slideNo}
        </kbd>
      ));
      return (
        <span className="slide-tags">
          {!done && <span>attach comment to slide{plural && 's'}</span>}
          {slideKeys}
          {!done && (
            <button
              onClick={this.clearButton}
              className="btn btn-menu pull-right">
              clear
            </button>
          )}
        </span>
      );
    }
  };

  renderSubmit = () => {
    let {filtered} = this.state;
    let context = this.renderSlideTags(filtered);

    return (
      <div className="alert">
        {context}
        <hr />
        <textarea
          type="text"
          placeholder="write your feedback here. press enter to submit."
          onKeyDown={this.addComment}
          className="code"
        />
      </div>
    );
  };

  renderFiles = () => {
    const {files} = this.props;
    return files.map((f, key) => {
      let link = Files.findOne({_id: f._id}).link('original', '//');
      return (
        <FileReview
          key={'file-' + key}
          iter={key + 1}
          fileUrl={link}
          fileId={f._id}
          fileName={f.name}
          handleMouse={this.handleSlide}
          handleLoad={this.handleLoad}
        />
      );
    });
  };

  renderCommentFilter = () => {
    const {files} = this.props;
    const {invert, filter} = this.state;
    const invFn = () => this.setState({invert: !invert});
    const setSort = (s, f) => {
      return () => this.setState({sorter: s, filter: f});
    };

    const timeSort = setSort('created', 'time');
    const authSort = setSort(x => x.author.toLowerCase(), 'auth');
    const slideSort = setSort(
      x => (x.slides[0] ? Number(x.slides[0].slideNo) : Infinity),
      'slide',
    );

    return (
      <div className="blue float-at-top">
        <h2 className="clearfix">
          comments
          <div className="pull-right">
            <button onClick={timeSort} className="btn btn-menu">
              time {filter === 'time' ? '✔' : ''}
            </button>
            <button className="btn btn-menu" onClick={authSort}>
              author {filter === 'auth' ? '✔' : ''}
            </button>
            <button className="btn btn-menu" onClick={slideSort}>
              slide {filter === 'slide' ? '✔' : ''}
            </button>
            <button className="btn btn-menu" onClick={invFn}>
              order {invert ? '▼' : '▲'}
            </button>
          </div>
        </h2>
      </div>
    );
  };

  goToTop = () => {
    const view = document.getElementById('review-view');
    if (view) {
      view.scrollIntoView();
    }
  };

  renderComments = () => {
    const {sorter, invert, byAuth} = this.state;
    const {comments} = this.props;
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

      const commentElements = csort.map((c, i) => {
        c.last = i === csort.length - 1; // no hr
        const context = this.renderSlideTags(c.slides, true);
        return (
          <Comment
            {...c}
            key={c._id}
            handleAuthor={this.setByAuth}
            context={context}
          />
        );
      });

      return (
        <div id="comments-list" className="alert">
          {commentElements}
        </div>
      );
    }
  };

  renderContext = () => {
    const {image, byAuth} = this.state;
    return (
      <div className="float-at-top">
        <Img className="big-slide" source={image} />
        <div className="alert center">
          <Clock />
          {byAuth && (
            <div>
              <hr />
              <p>
                <strong>author </strong>
                {byAuth}
                <button
                  onClick={this.clearByAuth}
                  className="btn btn-menu pull-right">
                  clear
                </button>
              </p>
            </div>
          )}
          <hr />
          <div className="btns-group">
            <button onClick={this.goToTop} className="btn btn-empty">
              to top
            </button>
          </div>
        </div>
      </div>
    );
  };

  render() {
    const {files, reviewer} = this.props;
    const submitter = this.renderSubmit();
    const fileList = this.renderFiles();
    const cmtHead = this.renderCommentFilter();
    const comments = this.renderComments();
    const context = this.renderContext();

    return files ? (
      this.renderRedirect() || (
        <div className="reviewView">
          <h1 className="clearfix">
            share feedback
            <small
              onClick={this.clearReviewer}
              className="pull-right clear-icon">
              {reviewer}
            </small>
          </h1>

          <div id="review-view" className="table">
            <div className="row">
              <div className="col-md-4 hide-md-4 no-float full-height">
                {context}
              </div>
              <div className="col-md-8">
                <div id="grid" onMouseDown={this.clearGrid}>
                  {fileList}
                </div>
                {submitter}
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
