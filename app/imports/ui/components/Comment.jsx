import React, {Component} from 'react';
import PropTypes from 'prop-types';
import BaseComponent from '../components/BaseComponent.jsx';
import Markdown from 'react-markdown';
import {
  createComment,
  updateComment,
  deleteComment,
} from '../../api/comments/methods.js';

class Comment extends BaseComponent {
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

  render() {
    const {author, content, created, context, last, handleAuthor} = this.props;
    return (
      <div className="clearfix comment">
        <div className="hover-menu">
          <div className="btn-group btns-empty">
            <button className="btn btn-empty">
              <span className="icon-add" />
            </button>
            <button className="btn btn-empty">
              <span className="icon-add" />
            </button>
            <button className="btn btn-empty">
              <span className="icon-add" />
            </button>
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
