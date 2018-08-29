import React, {Component} from 'react';
import PropTypes from 'prop-types';
import BaseComponent from '../components/BaseComponent.jsx';
import Markdown from 'react-markdown';
import {
  createComment,
  updateComment,
  deleteComment,
} from '../../api/comments/methods.js';

function CommentButton({icon, txt, handleClick, master}) {
  return (
    <button
      title={txt}
      data-toggle="tooltip"
      data-placement="top"
      onClick={handleClick}
      className={`btn btn-empty ${master && 'btn-user'}`}>
      <span className={'icon-' + icon} />
    </button>
  );
}

class Comment extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {fading: false};
  }

  componentDidMount = () => {
    const togs = $('[data-toggle="tooltip"]');
    //togs.tooltip(); // enable
    //togs.tooltip('show'); // for visual debugging
    togs.tooltip({
      trigger: 'hover',
      template: '<div class="tooltip"><div class="tooltip-inner"></div></div>',
    });
  };

  componentWillUnmount = () => {
    console.log('unmount');
  };

  confirmRemoveComment = () => {
    const {setModal, clearModal, content} = this.props;
    setModal({
      accept: this.removeComment,
      deny: clearModal,
      mtitle: 'delete comment?',
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

  editComment = () => {
    // TODO - update for comments from files
    const {fileId, fileName} = this.props;
    let validName = /[^a-zA-Z0-9 \.:\+()\-_%!&]/gi;
    let newName = window.prompt('New file name?', fileName) || '';
    let trimmed = newName.replace(validName, '-').trim();
    if (trimmed != '') {
      renameFile.call({fileId, newName: trimmed});
    } else {
      console.error('bad/empty file name');
    }
  };

  pubButtons = [
    {
      handleClick: console.log,
      icon: 'reply',
      txt: 'reply',
    },
    {
      handleClick: console.log,
      icon: 'good',
      txt: 'agree',
    },
    {
      handleClick: console.log,
      icon: 'flag',
      txt: 'discuss',
    },
  ];

  privButtons = [
    {
      handleClick: console.log,
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

  render() {
    const {hover} = this.state;
    const {
      author,
      style,
      content,
      created,
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
      <div style={style} className={'clearfix comment'}>
        <div className="hover-menu">
          <div className="btn-group btns-empty">
            {bData.map((button, i) => <CommentButton {...button} key={i} />)}
          </div>
        </div>

        <div className="pull-right">{context}</div>
        <strong data-auth={author} className="author" onClick={handleAuthor}>
          {author}
        </strong>
        <small> {created.toLocaleTimeString()} </small>
        <br />
        <Markdown source={content} />
        {!last && <hr />}
      </div>
    );
  }
}

export default Comment;
