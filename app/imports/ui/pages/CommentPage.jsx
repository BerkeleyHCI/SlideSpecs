import {Meteor} from 'meteor/meteor';
import React, {Component} from 'react';
import {Session} from 'meteor/session.js';
import {Link} from 'react-router-dom';
import _ from 'lodash';

import {Images} from '../../api/images/images.js';
import BaseComponent from '../components/BaseComponent.jsx';
import TextArea from '../components/TextArea.jsx';
import SlideTags from '../components/SlideTags.jsx';
import ClearingDiv from '../components/ClearingDiv.jsx';
import FileReview from '../components/FileReview.jsx';
import Clock from '../components/Clock.jsx';
import Img from '../components/Image.jsx';
import Comment from '../components/Comment.jsx';
import {createComment} from '../../api/comments/methods.js';

// Control-log.
import {Logger} from 'meteor/ostrio:logger';
import {LoggerConsole} from 'meteor/ostrio:loggerconsole';

class CommentPage extends BaseComponent {
  constructor(props) {
    super(props);

    // Control-log.
    this.logger = new Logger();
    new LoggerConsole(this.logger).enable();

    this.inRef = React.createRef();
    this.state = {
      defaultPriv: false,
      following: true,
      focusing: false,
      redirectTo: null,
      activeComment: null,
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
    const itemSel = {itemSelector: '.file-item'};
    const mason = new Masonry(grid, itemSel);
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
    Meteor.logout(); // clear
  };

  updateImage = id => {
    try {
      this.setState({image: Images.findOne(id).link('original', '//')});
    } catch (e) {
      console.error(e);
    }
  };

  updateHoverImage = id => {
    try {
      this.setState({hoverImage: Images.findOne(id).link('original', '//')});
    } catch (e) {
      console.error(e);
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
    const {following} = this.state;
    if (!following) {
      const base = e.target.className.split()[0];
      const matches = [/col-/, /review-table/];
      if (matches.some(x => base.match(x))) {
        this.clearButton();
      }
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
    const {defaultPriv, following} = this.state;
    const {reviewer, talkId, sessionId} = this.props;
    const slides = this.state.filtered;
    const cText = this.inRef.current.value.trim();
    const priv = cText.includes('#private');
    const commentFields = {
      author: reviewer,
      content: cText,
      session: sessionId,
      talk: talkId,
      userOwn: defaultPriv || priv,
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

  togglePrivate = () => {
    const defaultPriv = !this.state.defaultPriv;
    this.setState({defaultPriv});
  };

  toggleFollow = () => {
    const following = !this.state.following;
    this.setState({following});
  };

  toggleFocus = () => {
    const focusing = !this.state.focusing;
    this.setState({focusing});
  };

  renderCommentHead = () => {
    const {defaultPriv, following, focusing} = this.state;
    return (
      <span className="comment-config pull-right">
        <span className="comment-option" onClick={this.togglePrivate}>
          <i className={'fa fa-' + (defaultPriv ? 'lock' : 'globe')} />{' '}
          {defaultPriv ? 'private' : 'public'}
        </span>{' '}
        |{' '}
        <span className="comment-option" onClick={this.toggleFocus}>
          <i className={'fa fa-' + (focusing ? 'eye' : 'comments')} />{' '}
          {focusing ? 'focus' : 'all'}
        </span>
      </span>
    );
  };

  /*
{' '}|{' '}
<span className="comment-option" onClick={this.toggleFollow}>
<i className={'fa fa-' + (following ? 'image' : 'tag')} />{' '}
{following ? 'auto' : 'manual'}
</span>
*/

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
            author
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
    const {defaultPriv} = this.state;
    return (
      <div className="submitter">
        {defaultPriv && <i className="pull-right fa fa-lock textarea-icon" />}
        <TextArea
          inRef={this.inRef}
          handleSubmit={this.addComment}
          defaultValue="add feedback here."
          className="code comment-text"
        />
      </div>
    );
  };

  renderFiles = () => {
    const {images} = this.props;
    return images.map((f, key) => {
      let link = '404';
      try {
        link = Images.findOne({_id: f._id}).link('original', '//');
      } catch (e) {
        console.error(e);
      }
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
          handleLoad={this.handleLoad}
        />
      );
    });
  };

  renderFilter = () => {
    const cHead = this.renderCommentHead();
    const submitter = this.renderSubmit();
    const tagList = this.renderTags();
    let {byAuth, bySlide, byTag} = this.state;
    const sType = bySlide === 'general' ? 'scope' : 'slide';
    if (bySlide) bySlide = <kbd>{bySlide}</kbd>;

    return (
      <div className="filterer alert">
        <p>
          {cHead}
          <Clock />
        </p>
        <hr />
        <p> {tagList} </p>
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
      <a key={tag} onClick={this.insertTag} className="tag-link">
        {tag}
      </a>
    ));
  };

  goToTop = () => {
    const view = document.getElementsByClassName('comments-head');
    if (view[0]) {
      view[0].scrollIntoView({block: 'center', inline: 'center'});
    }
  };

  renderComments = () => {
    const {
      sorter,
      invert,
      filtered,
      activeComment,
      focusing,
      byAuth,
      bySlide,
      byTag,
    } = this.state;
    const {sessionId, comments, reviewer, setModal, clearModal} = this.props;
    if (!comments || !comments.length) {
      return <div className="alert"> no comments yet</div>;
    } else {
      let csort = _.orderBy(
        comments,
        [sorter, 'created'],
        [invert ? 'desc' : 'asc', 'asc'],
      );

      // Focus view filtering - omit replies.
      if (focusing) {
        csort = csort.filter(c => c.author === reviewer);
      }

      // Filtering 'reply' comments into array. HATE.
      // TODO - make it so this seperates on punctuation
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
          sessionId,
          clearModal,
          activeComment,
          log: this.log,
          focused: focusing,
          bySlide: bySlide,
          allReplies: replies,
          commentRef: this.inRef,
          handleTag: this.setByTag,
          handleAuthor: this.setByAuth,
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
          <h2 className="comments-head"> comments </h2>
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
                <i className={'fa fa-arrow-up no-padding'} />
              </button>
              <div className="v-pad" />
            </div>
          )}
          {items.length == 0 && <div className="alert"> no comments</div>}
        </div>
      );
    }
  };

  renderContext = () => {
    const fileList = this.renderFiles();
    const {image, hoverImage, filtered, bySlide} = this.state;
    const {name, session, reviewer} = this.props;
    const imgSrc = hoverImage ? hoverImage : image;

    return (
      <div className="context-filter float-at-top">
        <h2 className="alert clearfix no-margin">
          <Link to={`/share/${session._id}`}>
            <span className="black"> ‹ </span>
            {name}
          </Link>
          <small onClick={this.clearReviewer} className="pull-right clear-icon">
            {reviewer}
          </small>
        </h2>
        <Img className="big-slide" source={imgSrc} />
        <div id="grid-holder">
          <div id="grid" onMouseDown={this.clearGrid}>
            {fileList}
          </div>
        </div>
        <div className="v-pad" />
        {filtered.length > 0 && (
          <div className="no-margin clearfix alert bottom">
            <SlideTags
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

  render() {
    const {files, userId} = this.props;
    const cmtHead = this.renderCommentFilter();
    const comments = this.renderComments();
    const context = this.renderContext();

    const mu = Meteor.user();
    const sessionOwner = mu && mu._id == userId;
    return files ? (
      this.renderRedirect() || (
        <div className="reviewView">
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

export default CommentPage;
