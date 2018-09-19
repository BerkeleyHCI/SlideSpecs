import React, {Component} from 'react';
import PropTypes from 'prop-types';
import BaseComponent from '../components/BaseComponent.jsx';
import TextArea from '../components/TextArea.jsx';
import AppNotification from '../components/AppNotification.jsx';
import SlideTags from '../components/SlideTags.jsx';
import Markdown from 'react-markdown';
import {toast} from 'react-toastify';
import _ from 'lodash';
import {Comments} from '../../api/comments/comments.js';
import {setRespondingComment} from '../../api/sessions/methods.js';
import {
  agreeComment,
  discussComment,
  createComment,
  updateComment,
  deleteComment,
  addressComment,
} from '../../api/comments/methods.js';

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
      if (props.href[0] == '#') {
        const scrollView = e => {
          e.preventDefault();
          const _id = props.href.substring(2);
          this.props.setActive(_id);
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
          <a href={props.href} target="_blank">
            {props.children}
          </a>
        );
      }
    },
    text: props => {
      // split here for hashtag rendering
      // TODO handle ending punctuation
      const id = this.props._id;
      const words = props.split(/\s+/).map((x, i) => {
        if (x[0] == '#' && x.length > 1) {
          return (
            <span key={id + props + i}>
              <a className="hashtag" onClick={this.props.handleTag}>
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

  handleEdit = e => {
    const newContent = this.editRef.current.value.trim();
    const {author, discuss, reviewer, _id} = this.props;
    const sysDiscuss = discuss.includes('system');
    const editFields = {
      author: sysDiscuss ? author : reviewer, // make globally editable
      commentId: _id,
      newContent,
    };

    this.props.log({type: 'edit', ...editFields});
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
    const commentFields = {
      author: reviewer,
      commentId: _id,
    };

    toast(() => (
      <AppNotification
        msg="Agreed"
        desc="Agreed with comment."
        icon="thumbs-up"
      />
    ));

    this.props.log({type: 'agree', ...commentFields});
    if (reviewer && _id) {
      agreeComment.call(commentFields);
    }
  };

  handleDiscuss = () => {
    const {reviewer, _id} = this.props;
    const commentFields = {
      author: reviewer,
      commentId: _id,
    };

    toast(() => (
      <AppNotification
        msg="Marked"
        desc="Marked for discussion."
        icon="comments"
      />
    ));

    this.props.log({type: 'discuss', ...commentFields});
    if (reviewer && _id) {
      discussComment.call(commentFields);
    }
  };

  handleAddress = () => {
    const {_id} = this.props;
    addressComment.call({commentId: _id});
  };

  handleSpeech = () => {
    const {discuss, sessionId, _id} = this.props;
    const commentFields = {
      sessionId,
      commentId: _id,
    };

    if (sessionId && _id) {
      setRespondingComment.call(commentFields);
    }

    if (this.props.startRecord) {
      this.props.startRecord();
    }

    if (discuss.length == 0) {
      this.handleDiscuss();
    }

    toast(() => (
      <AppNotification
        msg="Ready"
        desc="Discuss comment with microphone."
        icon="microphone"
      />
    ));
  };

  extractCommentData = x => {
    return {
      _id: x.getAttribute('data-id'),
      auth: x.getAttribute('data-auth'),
    };
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

  addressButton = {
    handleClick: this.handleAddress,
    master: true,
    icon: this.props.addressed ? 'times' : 'check',
    txt: this.props.addressed ? 'undo' : 'address',
  };

  talkButton = {
    handleClick: this.handleSpeech,
    master: true,
    icon: 'microphone',
    txt: 'speak',
  };

  privButtons = [this.editButton, this.trashButton, this.talkButton];

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

  renderCommentButton = ({icon, key, txt, handleClick, master}) => {
    const {feedback, reviewer, _id} = this.props;
    return (
      !feedback && (
        <button
          key={key}
          title={txt}
          data-id={_id}
          data-auth={reviewer}
          data-toggle="tooltip"
          data-placement="top"
          onClick={handleClick}
          className={`btn btn-empty ${master && 'btn-user'}`}>
          <i className={'fa fa-' + icon} />
        </button>
      )
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
      last,
      log,
      depth,
      reviewer,
      replies,
      isReply,
      userOwn,
      allReplies,
      activeComment,
      discussView,
      addressed,
      bySlide,
      handleAuthor,
      slides,
      handleSlideIn,
      handleSlideOut,
      clearButton,
      clearBySlide,
      setBySlide,
    } = this.props;

    const master = author === reviewer;
    const sysDiscuss = discuss.includes('system');
    let bData;
    if (discussView && depth == 0) {
      bData = [this.addressButton, this.talkButton];
    } else if (discussView) {
      bData = [this.talkButton];
    } else if (sysDiscuss) {
      bData = [...this.pubButtons, this.editButton];
    } else if (master) {
      bData = [...this.pubButtons, ...this.privButtons];
    } else {
      bData = this.pubButtons;
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

    const replyProps = replies.map((c, i) => {
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
          className={
            'clearfix comment ' +
            (last ? ' last-comment' : '') +
            (active ? ' active-comment' : '') +
            (isReply ? ` reply-comment-${depth}` : '')
          }>
          <div className="hover-menu">
            <div className="btn-group btns-empty">
              {bData.map((button, i) =>
                this.renderCommentButton({...button, key: i}),
              )}
            </div>
          </div>

          <div className="pull-right">{context}</div>
          <strong data-auth={author} className="author" onClick={handleAuthor}>
            {author}
          </strong>
          <small>
            {created.toLocaleTimeString()}
            {userOwn && (
              <span>
                {' '}
                <i className={'fa fa-lock'} />{' '}
              </span>
            )}
            {agree && this.renderMeta('agreed', agree)}
            {discuss && this.renderMeta('discuss', discuss)}
          </small>

          <br />
          <Markdown
            className="markdown-comment"
            disallowedTypes={['image', 'imageReference']}
            unwrapDisallowed={true}
            renderers={this.renderers}
            source={content}
          />

          {!last && <hr />}
        </div>

        <div>{replyProps.map(rp => <Comment {...this.props} {...rp} />)}</div>
      </div>
    );
  };

  renderEditor = () => {
    const {_id, author, content} = this.props;
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
  allReplies: [],
  isReply: false,
  replies: [],
  depth: 0,
};

export default Comment;
