import React, {Component} from 'react';
import PropTypes from 'prop-types';
import BaseComponent from '../components/BaseComponent.jsx';
import TextArea from '../components/TextArea.jsx';
import Markdown from 'react-markdown';
import {
  agreeComment,
  discussComment,
  createComment,
  updateComment,
  deleteComment,
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
      // TODO add hover action for preview
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
          <a className="internal reply" onClick={scrollView}>
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
      // TODO handle ending punctuation
      // split here for hashtag rendering
      const words = props.split(/\s/).map((x, i) => {
        if (x[0] == '#' && x.length > 1) {
          return (
            <span key={props + i}>
              <a className="hashtag" onClick={this.props.handleTag}>
                {x}
              </a>{' '}
            </span>
          );
        } else {
          return <span key={props + i}>{x} </span>;
        }
      });

      return <span key={props}>{words}</span>;
    },
  };

  confirmRemoveComment = () => {
    const {setModal, clearModal, content} = this.props;
    setModal({
      accept: this.removeComment,
      deny: clearModal,
      mtitle: 'Delete this comment?',
      mtext: content,
      act: 'delete',
      isOpen: true,
    });
  };

  removeComment = () => {
    const {_id, author} = this.props;
    deleteComment.call({commentId: _id, author});
    this.props.clearModal();
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

  handleEdit = e => {
    const newContent = this.editRef.current.value.trim();
    const {reviewer, _id} = this.props;
    updateComment.call(
      {
        author: reviewer,
        commentId: _id,
        newContent,
      },
      () => {
        this.clearEdit();
      },
    );
  };

  handleReply = () => {
    const {commentRef, author, _id} = this.props;
    const commText = commentRef.current;
    if (commText) {
      commText.scrollIntoView(false);
      commText.value += ` [${author}'s comment](#c${_id})`;
      commText.focus();
    }
  };

  handleAgree = () => {
    const {reviewer, _id} = this.props;
    const commentFields = {
      author: reviewer,
      commentId: _id,
    };

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

    if (reviewer && _id) {
      discussComment.call(commentFields);
    }
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

  privButtons = [
    {
      handleClick: this.setEdit,
      master: true,
      icon: 'pencil',
      txt: 'edit',
    },
    {
      handleClick: this.confirmRemoveComment,
      master: true,
      icon: 'trash',
      txt: 'delete',
    },
  ];

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
    const {reviewer, _id} = this.props;
    return (
      <button
        key={key}
        title={txt}
        data-id={_id}
        data-auth={reviewer}
        data-toggle="tooltip"
        data-placement="left"
        onClick={handleClick}
        className={`btn btn-empty ${master && 'btn-user'}`}>
        <i className={'fa fa-' + icon} />
      </button>
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
      context,
      last,
      reviewer,
      handleAuthor,
    } = this.props;
    const master = author === reviewer;
    let bData;
    if (master) {
      bData = [...this.pubButtons, ...this.privButtons];
    } else {
      bData = this.pubButtons;
    }

    return (
      <div
        id={'c' + _id}
        onBlur={this.clearEdit}
        className={'clearfix comment ' + (active ? 'active-comment' : '')}>
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
          {agree && this.renderMeta('agreed', agree)}
          {discuss && this.renderMeta('discuss', discuss)}
        </small>

        <br />
        <Markdown
          className="markdown-comment"
          source={content}
          renderers={this.renderers}
        />

        {!last && <hr />}
      </div>
    );
  };

  renderEditor = () => {
    const {_id, author, content} = this.props;
    return (
      <div onBlur={this.clearEdit} className="clearfix comment editing">
        <strong>{author}</strong>
        <i> editing... </i>
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

export default Comment;
