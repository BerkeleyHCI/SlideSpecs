import {Meteor} from 'meteor/meteor';
import React, {Component} from 'react';
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
          this.clearSelection();
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
        <span>
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
          placeholder="write comment here, press enter to submit."
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
    );
  };

  renderComments = () => {
    const {sorter, invert} = this.state;
    const {comments} = this.props;
    if (!comments || !comments.length) {
      return <div className="alert"> no comments yet</div>;
    } else {
      const csort = _.orderBy(
        comments,
        [sorter, 'created'],
        [invert ? 'desc' : 'asc', 'asc'],
      );

      const commentElements = csort.map((c, i) => {
        c.last = i === csort.length - 1; // no hr
        const context = this.renderSlideTags(c.slides, true);
        return <Comment key={c._id} {...c} context={context} />;
      });

      return <div className="alert">{commentElements}</div>;
    }
  };

  scrollTop = () => {
    var a = function() {
      var b = $(window).scrollTop();
      var d = $('#scroller-anchor').offset({scroll: false}).top;
      var c = $('#scroller');
      if (b > d) {
        c.css({position: 'fixed', top: '0px'});
      } else {
        c.css({position: 'relative', top: ''});
      }
    };
    $(window).scroll(a);
    a();
  };

  render() {
    const {image} = this.state;
    const {files} = this.props;
    const submitter = this.renderSubmit();
    const fileList = this.renderFiles();
    const cmtHead = this.renderCommentFilter();
    const comments = this.renderComments();
    return files ? (
      this.renderRedirect() || (
        <div className="reviewView">
          <h1>share feedback</h1>
          <div className="row">
            <div className="col-md-4">
              <Img className="big-slide" source={image} />
              <div className="alert center">
                <Clock />
              </div>
            </div>
            <div className="col-md-8">
              <div id="grid" onMouseDown={this.clearGrid}>
                {fileList}
              </div>
              {submitter}
            </div>
          </div>

          {cmtHead}
          <div className="row">
            <div className="col-md-4 hide-md-4">
              <Img className="big-slide" source={image} />
              <div className="alert center">
                <Clock />
              </div>
            </div>
            <div className="col-md-8">{comments}</div>
          </div>
        </div>
      )
    ) : (
      <div>loading file list...</div>
    );
  }
}

export default SlideReviewPage;
