import {Meteor} from 'meteor/meteor';
import React, {Component} from 'react';
import {Session} from 'meteor/session.js';
import {Link} from 'react-router-dom';
import _ from 'lodash';

import {Images} from '../../api/images/images.js';
import BaseComponent from '../components/BaseComponent.jsx';
import Input from '../components/Input.jsx';
import ClearingDiv from '../components/ClearingDiv.jsx';
import TextArea from '../components/TextArea.jsx';
import FileReview from '../components/FileReview.jsx';
import Img from '../components/Image.jsx';
import Message from '../components/Message.jsx';
import Comment from '../components/Comment.jsx';
import {createComment, completeComment} from '../../api/comments/methods.js';

class ReviewPage extends BaseComponent {
  constructor(props) {
    super(props);
    this.inRef = React.createRef();
    this.state = {
      redirectTo: null,
      activeComment: null,
      commentsShown: 0,
      sorter: 'created',
      filter: 'time',
      invert: true,
      filtered: [],
      tags: [],
      bySlide: [],
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
    let {ds} = this.state;
    const updateSelection = () => {
      const s = ds.getSelection();
      if (s.length > 0) {
        const filtered = s.map(this.extractFileData);
        const bySlide = filtered.map(s => s.slideNo);
        this.setState({filtered, bySlide});
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
    this.handleLoad();
    setTimeout(() => {
      const items = document.querySelectorAll('.file-item');
      const nodes = Array.prototype.slice.call(items).map(this.elementize);
      this.handleSelectable(nodes);
    }, 500);

    // set image to link of the first slide
    const {images} = this.props;
    if (images.length > 0) {
      this.updateImage(images[0]._id);
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
    const base = e.target.className.split()[0];
    const matches = [/col-/, /review-table/];
    if (matches.some(x => base.match(x))) {
      this.clearBySlide();
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
    const { invert, filter} = this.state;
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
          handleMouse={this.handleSlideIn}
          handleMouseOut={this.handleSlideOut}
          handleLoad={this.handleLoad}
        />
      );
    });
  };

  renderFilter = () => {
    let {comments} = this.props;
    let {byAuth, bySlide, byTag, filtered, commentsShown} = this.state;
    const tagList = this.renderTags();
    const slideKeys = this.renderSlideTags(filtered);
    const sType = bySlide === ['general'] ? 'scope' : 'slide';
    return (
      <div className="filterer alert no-submit border-bottom">
        <p>
          <kbd className="pull-right">
            {commentsShown}/{comments.length}
          </kbd>
          {tagList}
        </p>
        <ClearingDiv set={byTag} pre="tag" clear={this.clearByTag} />
        <ClearingDiv set={byAuth} pre="author" clear={this.clearByAuth} />
        <ClearingDiv set={slideKeys} pre={sType} clear={this.clearBySlide} />
      </div>
    );
  };

  renderTags = () => {
    const {byTag} = this.state;
    const {comments} = this.props;
    const getTag = t => t.split(/\s/).filter(t => t[0] == '#' && t.length > 1);
    const alltags = _.flatten(comments.map(c => getTag(c.content)));
    const tagCount = _.countBy(alltags); // object
    const unique = _.orderBy(
      _.toPairs(tagCount),
      [x => x[1], x => [0]],
      ['desc', 'asc'],
    ); // array

    return unique.map((tag, i) => {
      const active = tag[0] == byTag;
      return (
        <span
          key={tag + i}
          className={'tag-group ' + (active ? 'tag-active' : '')}>
          <a onClick={this.setByTag} className="tag-link ">
            {tag[0]}
          </a>
          <kbd className="tag-count">{tag[1]} </kbd>
        </span>
      );
    });
  };

  goToTop = () => {
    const view = document.getElementsByClassName('nav-head');
    if (view[0]) {
      view[0].scrollIntoView();
    }
  };

  renderComments = () => {
    const {
      commentsShown,
      sorter,
      invert,
      activeComment,
      byAuth,
      bySlide,
      byTag,
    } = this.state;
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

      if (commentsShown !== csort.length) {
        this.setState({commentsShown: csort.length});
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
          {incomplete.length > 0 && (
            <div>
              <h2>to address</h2>
              <div id="comments-list" className="alert">
                {incomplete.map((i, iter) => (
                  <Comment {...i} key={`comment-${iter}`} />
                ))}
              </div>
            </div>
          )}

          {completed.length > 0 && (
            <div>
              <h2>addressed</h2>
              <div id="comments-list" className="alert">
                {completed.map(i => (
                  <Comment {...i} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="alert"> no matching comments</div>
      );
    }
  };

  renderContext = () => {
    const fileList = this.renderImages();
    const {image, hoverImage, filtered} = this.state;
    const {talk, name} = this.props;
    const imgSrc = hoverImage ? hoverImage : image;

    return (
      <div className="context-filter float-at-top">
        <h2 className="alert clearfix no-margin">
          <Link to={`/talk/${talk._id}`}>
            <span className="black"> ‹ </span>
            {name}
          </Link>{' '}
          / <small> review </small>
        </h2>
        <Img className="big-slide" source={imgSrc} />
        <div id="grid-holder">
          <div id="grid" onMouseDown={this.clearGrid}>
            <div className="v-pad" />
            {fileList}
            <div className="v-pad" />
          </div>
        </div>
      </div>
    );
  };

  render() {
    const {images} = this.props;
    const cmtHead = this.renderCommentFilter();
    const comments = this.renderComments();
    const context = this.renderContext();

    return images ? (
      this.renderRedirect() || (
        <div className="reviewView" onMouseDown={this.clearButtonBG}>
          <div id="review-view" className="table review-table">
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
      <div>waiting for slides...</div>
    );
  }
}

export default ReviewPage;
