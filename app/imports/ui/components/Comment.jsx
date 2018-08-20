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
    this.hover = '';
  }

  clearHover = event => {
    this.setState({hover: ''});
  };

  componentDidMount = () => {
    $('[data-toggle="tooltip"]').tooltip();
  };

  handleMouse = e => {
    const hover = e.target.getAttribute('data-hv');
    if (hover) {
      this.setState({hover});
    }
  };

  removeComment = () => {
    const {commentId, author} = this.props;
    deleteComment.call({commentId, author});
  };

  editComment = () => {
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
      handleClick: console.log,
      master: true,
      icon: 'trash',
      txt: 'delete',
    },
  ];

  render() {
    const {hover} = this.state;
    const {
      author,
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
      <div className="clearfix comment">
        <div className="hover-menu">
          <div className="btn-group btns-empty">
            {bData.map((button, i) => {
              return <CommentButton {...button} key={'key-' + i} />;
            })}
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
