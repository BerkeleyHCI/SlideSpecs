import React from 'react';
import PropTypes from 'prop-types';
import ReactAudioPlayer from 'react-audio-player';
import Markdown from 'react-markdown';
import {toast} from 'react-toastify';

import BaseComponent from '../components/BaseComponent.jsx';
import TextArea from '../components/TextArea.jsx';
import AppNotification from '../components/AppNotification.jsx';
import SlideTags from '../components/SlideTags.jsx';

import {setRespondingComment} from '../../api/talks/methods.js';
import {Sounds} from '../../api/sounds/sounds.js';
import {
  agreeComment,
  discussComment,
  updateComment,
  deleteComment,
  addressComment,
  completeComment,
} from '../../api/comments/methods.js';

const CommentButton = ({_id, reviewer, icon, txt, handleClick, master}) => {
  return (
    <button
      title={txt}
      data-id={_id}
      data-auth={reviewer}
      data-toggle="tooltip"
      data-placement="top"
      onClick={handleClick}
      className={`btn btn-empty btn-list-item ${master && 'btn-user'}`}>
      <i className={'fa fa-' + icon} />
    </button>
  );
};

class Comment extends BaseComponent {
  constructor(props) {
    super(props);
    this.editRef = React.createRef();
    this.state = {editing: false, replying: false};
  }

  componentDidMount = () => {
    const togs = $('[data-toggle="tooltip"]');
    togs.tooltip({
      trigger: 'hover',
      template: '<div class="tooltip"><div class="tooltip-inner"></div></div>',
    });
  };

  goToElementId = id => {
    const view = document.getElementById(id);
    if (view) {
      view.scrollIntoView({block: 'center', inline: 'center'});
    }
  };

  renderers = {
    link: props => {
      const {handleTag, setActive, _id} = this.props;
      if (props.href[0] == '#') {
        const scrollView = e => {
          e.preventDefault();
          const _id = props.href.substring(2);
          setActive(_id);
          this.goToElementId('c' + _id);
        };
        return (
          <a
            key={props.children.toString() + this.props._id}
            className="internal reply"
            onClick={scrollView}>
            {props.children} <i className={'fa fa-reply'} />
          </a>
        );
      } else {
        return (
          <a href={props.href} target="_blank" rel="noopener noreferrer">
            {props.children}
          </a>
        );
      }
    },
    text: props => {
      const {handleTag, setActive, _id} = this.props;
      const id = this.props._id;
      // split here for hashtag rendering
      //const words = props.split(/\s+|.,\/#!$%\^&\*;:{}=\-_`~()/).map((x, i) => {
      const words = props.split(/\s+/).map((x, i) => {
        if (x[0] == '#' && x.length > 1) {
          return (
            <span key={id + props + i}>
              <a className="hashtag" onClick={handleTag}>
                {x}{' '}
              </a>
            </span>
          );
        } else {
          return <span key={id + props + i}>{x} </span>;
        }
      });

      return <span key={id + props}>{words}</span>;
    },
  };

  setEdit = () => {
    const {content} = this.props;
    this.setState({editing: true});
    setTimeout(() => {
      let eRef = this.editRef.current;
      eRef.value = content;
      eRef.focus();
    }, 50);
  };

  clearEdit = () => {
    this.setState({editing: false});
  };

  confirmRemoveComment = () => {
    const {setModal, clearModal, content, replies} = this.props;
    let modalContent;
    if (replies.length > 0) {
      modalContent = {
        accept: clearModal,
        deny: clearModal,
        mtitle: 'Comment cannot be removed as it has replies.',
        mtext: 'You can edit the content of the comment to be blank, though.',
        act: 'accept',
        isOpen: true,
      };
    } else {
      modalContent = {
        accept: this.removeComment,
        deny: clearModal,
        mtitle: 'Delete this comment?',
        mtext: content,
        act: 'delete',
        isOpen: true,
      };
    }
    setModal(modalContent);
  };

  removeComment = () => {
    const {_id, author} = this.props;
    deleteComment.call({commentId: _id, author});
    this.props.clearModal();
  };

  handleEdit = () => {
    const newContent = this.editRef.current.value.trim();
    const {author, discuss, reviewer, _id} = this.props;
    const editFields = {
      commentId: _id,
      newContent,
      author,
    };

    this.log({type: 'edit', ...editFields});
    updateComment.call(editFields, this.clearEdit);
    toast(() => (
      <AppNotification msg="updated" desc="Comment updated ok." icon="check" />
    ));
  };

  handleReply = () => {
    const {commentRef, author, _id} = this.props;
    const refText = ` [@${author}](#c${_id})`;
    const commText = commentRef.current;
    if (commText) {
      commText.scrollIntoView(false);
      if (!` ${commText.value}`.includes(refText)) {
        commText.value = (commText.value + refText).trim() + ' ';
      }
      commText.focus();
    }
  };

  handleAgree = () => {
    const {reviewer, _id} = this.props;
    if (reviewer && _id) {
      const commentFields = {
        author: reviewer,
        commentId: _id,
      };

      //toast(() => (
      //<AppNotification
      //msg="Agreed"
      //desc="Agreed with comment."
      //icon="thumbs-up"
      ///>
      //));

      this.log({type: 'agree', ...commentFields});
      agreeComment.call(commentFields);
    }
  };

  handleDiscuss = () => {
    const {reviewer, _id} = this.props;
    if (reviewer && _id) {
      const commentFields = {
        author: reviewer,
        commentId: _id,
      };

      this.log({type: 'discuss', ...commentFields});
      discussComment.call(commentFields);
    }
  };

  handleAddress = () => {
    const {talk, _id} = this.props;
    this.log({type: 'address', talkId: talk, commentId: _id});
    addressComment.call({commentId: _id});
  };

  handleComplete = () => {
    const {talk, _id} = this.props;
    this.log({type: 'complete', talkId: talk, commentId: _id});
    completeComment.call({commentId: _id});
  };

  handleActiveComment = () => {
    const {discuss, talk, _id, handleAudioUpload} = this.props;
    if (handleAudioUpload) {
      handleAudioUpload();
    }

    const commentFields = {
      talkId: talk,
      commentId: _id,
    };

    if (discuss.length == 0) {
      this.handleDiscuss();
    }

    if (talk && _id) {
      this.log({type: 'setDiscussing', ...commentFields});
      setRespondingComment.call(commentFields);
    }
  };

  handleFinishComment = () => {
    const {addressed, discuss, talk, _id} = this.props;
    const commentFields = {
      talkId: talk,
      commentId: _id,
    };

    if (discuss.length == 0) {
      this.handleDiscuss();
    }

    if (talk && _id) {
      this.log({type: 'setDiscussing', ...commentFields});
      setRespondingComment.call(commentFields);
      if (!addressed) {
        this.handleAddress();
      }
    }
  };

  pubButtons = [
    {
      handleClick: this.handleReply,
      icon: 'reply',
      txt: 'reply',
    },
    {
      handleClick: this.handleAgree,
      icon: 'thumbs-up',
      txt: 'agree',
    },
    {
      handleClick: this.handleDiscuss,
      icon: 'comments',
      txt: 'discuss',
    },
  ];

  editButton = {
    handleClick: this.setEdit,
    master: true,
    icon: 'pencil',
    txt: 'edit',
  };

  trashButton = {
    handleClick: this.confirmRemoveComment,
    master: true,
    icon: 'trash',
    txt: 'delete',
  };

  playButton = {
    handleClick: this.props.handlePlayAudio,
    icon: 'play',
    txt: 'play',
  };

  addressButton = {
    handleClick: this.handleAddress,
    master: true,
    icon: this.props.addressed ? 'times' : 'check',
    txt: this.props.addressed ? 'undo' : 'finish',
  };

  completeButton = {
    handleClick: this.handleComplete,
    master: true,
    icon: this.props.completed ? 'times' : 'check',
    txt: this.props.completed ? 'undo' : 'address',
  };

  activeButton = {
    handleClick: this.handleActiveComment,
    icon: 'star',
    txt: 'discuss',
  };

  // For active.
  finishButton = {
    handleClick: this.handleFinishComment,
    icon: 'check',
    txt: 'done',
  };

  privButtons = [this.editButton, this.trashButton];

  renderMeta = (tag, users) => {
    return (
      users.length > 0 && (
        <span className="meta">
          <strong> {tag}: </strong>
          {users.join(', ')}
        </span>
      )
    );
  };

  formatTime = time => {
    if (time < 0) {
      //console.error('negative comment region time: ', time);
      return null;
    }
    const secTime = time / 1000.0; // originally in millis
    const minutes = Math.floor(secTime / 60.0);
    const seconds = `${Math.floor(secTime % 60)}`.padStart(2, '0');
    const millis = ((secTime % 60) % 1).toFixed(1).substring(2);
    return `${minutes}:${seconds}.${millis}`;
  };

  renderTime = () => {
    const {startTime, stopTime} = this.props;
    if (!startTime || !stopTime) return null;
    return (
      <span className="meta">
        <strong> {this.formatTime(startTime)} </strong>—
        <strong> {this.formatTime(stopTime)} </strong>
      </span>
    );
  };

  renderComment = () => {
    const {replying} = this.state;
    const {
      _id,
      author,
      content,
      created,
      agree,
      active,
      discuss,
      focused,
      last,
      depth,
      reviewer,
      replies,
      isReply,
      userOwn,
      sounds,
      allReplies,
      addressed,
      bySlide,
      handleClick,
      handleAuthor,
      handleAudioUpload,
      handleMouseOver,
      handleMouseOut,
      slides,
      handleSlideIn,
      handleSlideOut,
      clearButton,
      clearBySlide,
      setBySlide,
      startTime,
      stopTime,
      wordList,

      activeComment,
      facilitateView,
      discussView,
      commentView,
      regionView,
      reviewView,
      responding,
    } = this.props;

    const master = author === reviewer;
    const audio = author === 'transcript';
    let bData = [];
    if (commentView && master) {
      bData = [...this.pubButtons, ...this.privButtons];
    } else if (commentView) {
      bData = [...this.pubButtons];
    } else if (facilitateView && depth == 0 && responding) {
      bData = [this.finishButton];
    } else if (facilitateView && depth == 0) {
      bData = [this.activeButton, this.addressButton];
    } else if (facilitateView) {
      bData = [this.editButton];
    } else if (discussView) {
      bData = [...this.pubButtons];
    } else if (regionView) {
      bData = [this.playButton];
    } else if (reviewView && depth == 0) {
      bData = [this.completeButton, this.trashButton];
    } else if (reviewView && audio) {
      bData = [this.trashButton];
    }

    const context = (
      <SlideTags
        done={true}
        slides={slides}
        bySlide={bySlide}
        handleSlideIn={handleSlideIn}
        handleSlideOut={handleSlideOut}
        clearButton={clearButton}
        clearBySlide={clearBySlide}
        setBySlide={setBySlide}
      />
    );

    const soundList = this.renderSounds();

    // always sort replies by time.
    const replyProps = replies
      .sort((a, b) => a.created > b.created)
      .map((c, i) => {
        return {
          ...c,
          isReply: true,
          key: i + c._id,
          depth: depth + 1,
          replies: allReplies.filter(r => r.replyTo == c._id),
          active: c._id === activeComment,
          last: false,
        };
      });

    return (
      <div>
        <div
          id={'c' + _id}
          onBlur={this.clearEdit}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
          onClick={handleClick}
          className={
            'clearfix comment ' +
            (last ? ' last-comment' : '') +
            (active ? ' active-comment' : '') +
            (isReply ? ` reply-comment-${depth}` : '')
          }>
          {!focused && bData.length > 0 && (
            <div className="hover-menu">
              <div className="btn-group btns-empty">
                {bData.map((button, i) => (
                  <CommentButton
                    reviewer={reviewer}
                    _id={_id}
                    {...button}
                    key={i}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="pull-right">{context}</div>
          <strong data-auth={author} className="author" onClick={handleAuthor}>
            {author}
          </strong>
          <small>
            {!regionView && created.toLocaleTimeString()}
            {userOwn && (
              <span>
                {' '}
                <i className={'fa fa-lock'} />{' '}
              </span>
            )}
            {!regionView && (
              <span>
                {agree && this.renderMeta('agreed', agree)}
                {discuss && this.renderMeta('discuss', discuss)}
              </span>
            )}
            {regionView && this.renderTime()}
          </small>

          <br />
          <Markdown
            className="markdown-comment"
            disallowedTypes={['image', 'imageReference']}
            unwrapDisallowed={true}
            renderers={this.renderers}
            source={content}
          />

          {wordList.length > 0 && (
            <span>
              <hr />
              <div className="v-pad">
                <b>discussion:</b> {wordList}
              </div>
            </span>
          )}

          {soundList}

          {!last && <hr />}
        </div>

        <div>
          {replyProps.map((rp, i) => (
            <Comment key={`comment-${i}`} {...this.props} {...rp} />
          ))}
        </div>
      </div>
    );
  };

  renderSounds = () => {
    const {sounds} = this.props;
    return sounds.map((audio, iter) => {
      let sound = Sounds.findOne(audio);
      if (sound) {
        const url = sound.link('original', '//');
        return <ReactAudioPlayer key={audio} src={url} controls />;
      }
    });
  };

  renderEditor = () => {
    const {author} = this.props;
    return (
      <div onBlur={this.clearEdit} className="clearfix comment editing">
        <strong>{author}</strong> · <i> editing... </i>
        <button onClick={this.clearEdit} className="btn pull-right">
          cancel
        </button>
        <br />
        <TextArea
          inRef={this.editRef}
          onBlur={this.clearEdit}
          handleSubmit={this.handleEdit}
        />
      </div>
    );
  };

  render() {
    const {editing} = this.state;
    return editing ? this.renderEditor() : this.renderComment();
  }
}

Comment.propTypes = {
  allReplies: PropTypes.array,
  isReply: PropTypes.bool,
  replies: PropTypes.array,
};

Comment.defaultProps = {
  wordList: [],
  allReplies: [],
  isReply: false,
  replies: [],
  sounds: [],
  depth: 0,
};

export default Comment;
