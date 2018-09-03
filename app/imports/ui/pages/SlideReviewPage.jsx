import {Meteor} from 'meteor/meteor';
import React, {Component} from 'react';
import {Session} from 'meteor/session.js';
import {withTracker} from 'meteor/react-meteor-data';
import {Link} from 'react-router-dom';
import _ from 'lodash';

//import $ from 'jquery';

import {Files} from '../../api/files/files.js';
import BaseComponent from '../components/BaseComponent.jsx';
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
    this.state = {
      redirectTo: null,
      activeComment: null,
      sorter: 'created',
      filter: 'time',
      invert: true,
      filtered: [],
      selected: [],
      bySlide: '',
      byAuth: '',
      showImage: false,
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
        //onElementSelect: updateSelection,
        //onElementUnselect: updateSelection,
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

    // hide context image
    this.handleSlideOut();
  };

  componentWillUnmount = () => {
    let {ds} = this.state;
    if (ds) {
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

  clearReviewer = () => {
    localStorage.setItem('feedbacks.reviewer', null);
    Session.set('reviewer', null);
  };

  updateSlideFile = fid => {
    const link = Files.findOne({_id: fid}).link('original', '//');
    this.setState({image: link, showImage: true});
  };

  handleSlide = e => {
    if (e.target === e.currentTarget) {
      const data = this.extractFileData(e.target);
      this.updateSlideFile(data.slideId);
    }
  };

  handleSlideOut = e => {
    this.setState({showImage: false});
  };

  handleSlideFile = e => {
    this.handleSlide(e);
    this.handleSlideOut();
  };

  getText = () => {
    const copyText = document.getElementsByClassName('comment-text')[0];
    if (copyText) {
      return copyText.value;
    } else {
      return '';
    }
  };

  clearText = () => {
    const copyText = document.getElementsByClassName('comment-text')[0];
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
    const {bySlide} = this.state;
    const active = sn => (sn === bySlide ? 'active' : '');
    if (filter.length === 0) {
      return done ? (
        <kbd className={active({slideNo: 'general'})} onClick={this.setBySlide}>
          general
        </kbd>
      ) : (
        'no slides selected, attach as general feedback'
      );
    } else {
      const plural = filter.length > 1;
      const slideNos = _.sortBy(filter, x => Number(x.slideNo));
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
          className="code comment-text"
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
          handleMouse={this.handleSlideFile}
          handleLoad={this.handleLoad}
        />
      );
    });
  };

  //handleMouseOut={this.handleSlideOut}

  renderCommentFilter = () => {
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
      <div className="blue float-at-top">
        <div className="btn-m-group btns-group">
          <button onClick={timeSort} className="btn btn-menu">
            time {filter === 'time' ? '✔' : ''}
          </button>
          <button className="btn btn-menu" onClick={authSort}>
            auth {filter === 'auth' ? '✔' : ''}
          </button>
          <button className="btn btn-menu" onClick={slideSort}>
            slide {filter === 'slide' ? '✔' : ''}
          </button>
          <button className="btn btn-menu" onClick={agreeSort}>
            agree {filter === 'agree' ? '✔' : ''}
          </button>
          <button className="btn btn-menu" onClick={flagSort}>
            flag {filter === 'flag' ? '✔' : ''}
          </button>
          <button className="btn btn-menu" onClick={invFn}>
            order {invert ? '▼' : '▲'}
          </button>
        </div>
      </div>
    );
  };

  goToTop = () => {
    const view = document.getElementsByClassName('nav-head');
    if (view[0]) {
      view[0].scrollIntoView();
    }
  };

  renderComments = () => {
    const {sorter, invert, activeComment, byAuth, bySlide} = this.state;
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
          handleAuthor: this.setByAuth,
          setActive: this.setActiveComment,
          unsetActive: this.clearActiveComment,
        };
      });

      return (
        <div id="comments-list" className="alert">
          {items.map(i => <Comment {...i} />)}
        </div>
      );
    }
  };

  renderContext = () => {
    const fileList = this.renderFiles();
    let {image, byAuth, bySlide} = this.state;
    const sType = bySlide === 'general' ? 'scope' : 'slide';
    if (bySlide) bySlide = <kbd>{bySlide}</kbd>;
    const ClearingDiv = ({set, pre, clear}) => {
      return (
        set && (
          <div>
            <hr />
            <p>
              <strong>{pre} </strong>
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
      <div className="float-at-top">
        <Img className="big-slide" source={image} />
        <div id="grid-holder">
          <div id="grid" onMouseDown={this.clearGrid}>
            {fileList}
          </div>
        </div>
        <div className="alert center">
          <Clock />
          <ClearingDiv set={byAuth} pre="author" clear={this.clearByAuth} />
          <ClearingDiv set={bySlide} pre={sType} clear={this.clearBySlide} />
          <hr />
          <div className="btns-group">
            <button onClick={this.goToTop} className="v-pad btn btn-empty">
              to top
            </button>
          </div>
        </div>
      </div>
    );
  };

  render() {
    let {image, showImage, byAuth, bySlide} = this.state;
    const {files, reviewer} = this.props;
    const submitter = this.renderSubmit();
    const cmtHead = this.renderCommentFilter();
    const comments = this.renderComments();
    const context = this.renderContext();

    return files ? (
      this.renderRedirect() || (
        <div className="reviewView">
          <h1 className="nav-head clearfix">
            share feedback
            <small
              onClick={this.clearReviewer}
              className="pull-right clear-icon">
              {reviewer}
            </small>
          </h1>

          <div id="review-view" className="table">
            <div className="row">
              <div className="col-md-5 full-height-md no-float">{context}</div>
              <div className="col-md-7">
                {cmtHead}
                {submitter}
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

//<Transition enter={{opacity: 1}} leave={{opacity: 0}}> {showImage && (styles => ( <div id="comment-image" style={styles}> <Img source={image} /> </div>))} </Transition>

export default SlideReviewPage;
