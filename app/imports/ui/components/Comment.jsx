import React, {Component} from 'react';
import PropTypes from 'prop-types';
import BaseComponent from '../components/BaseComponent.jsx';
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
    this.state = {editing: false};
  }

  componentDidMount = () => {
    const togs = $('[data-toggle="tooltip"]');
    //togs.tooltip('show'); // for visual debugging
    //togs.tooltip(); // enable
    togs.tooltip({
      trigger: 'hover',
      template: '<div class="tooltip"><div class="tooltip-inner"></div></div>',
    });
  };

  //componentWillUnmount = () => { };

  goToElementId = id => {
    const view = document.getElementById(id);
    if (view) {
      // Todo add active highligt
      // Or scrolling to center
      // Or hover action for preview
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
            {props.children}
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

  getText = () => {
    const {_id} = this.props;
    const copyText = document.getElementsByClassName('code' + _id)[0];
    if (copyText) {
      return copyText.value;
    } else {
      return '';
    }
  };

  setEdit = () => {
    this.setState({editing: true});
    const {_id} = this.props;
    setTimeout(() => {
      const copyText = document.getElementsByClassName('code' + _id)[0];
      copyText.focus();
    }, 70);
  };

  clearEdit = () => {
    this.setState({editing: false});
  };

  handleEdit = e => {
    const {reviewer, _id} = this.props;
    const newContent = this.getText().trim();
    const commentFields = {
      author: reviewer,
      commentId: _id,
      newContent,
    };

    if (newContent && e.keyCode === 13 && !e.shiftKey) {
      updateComment.call(commentFields);
      this.clearEdit();
    }
  };

  handleReply = () => {
    const {author, _id} = this.props;
    const commText = document.getElementsByClassName('comment-text')[1];
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
      icon: 'good',
      txt: 'agree',
    },
    {
      handleClick: this.handleDiscuss,
      icon: 'flag',
      txt: 'discuss',
    },
  ];

  privButtons = [
    {
      handleClick: this.setEdit,
      master: true,
      icon: 'edit',
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
        <span className={'icon-' + icon} />
      </button>
    );
  };

  renderComment = () => {
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
          {discuss && this.renderMeta('flagged', discuss)}
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
        <textarea
          type="text"
          onBlur={this.clearEdit}
          onKeyDown={this.handleEdit}
          defaultValue={content}
          className={'code' + _id}
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
