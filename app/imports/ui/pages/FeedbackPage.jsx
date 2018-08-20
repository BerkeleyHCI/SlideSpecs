import {Meteor} from 'meteor/meteor';
import React, {Component} from 'react';
import {Link} from 'react-router-dom';

import {Files} from '../../api/files/files.js';
import BaseComponent from '../components/BaseComponent.jsx';
import FileReview from '../components/FileReview.jsx';
import Message from '../components/Message.jsx';
import {
  createComment,
  renameComment,
  deleteComment,
} from '../../api/comments/methods.js';

class FeedbackPage extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      redirectTo: null,
      filtered: [],
    };
  }

  handleLoad = () => {
    const items = document.querySelectorAll('.file-item');
    new Masonry('.grid', items);
  };

  componentDidMount = () => {
    this.handleLoad();
    const grid = document.getElementById('grid');
    const items = document.querySelectorAll('.file-item');
    const ds = new DragSelect({selectables: items});
    ds.callback = () => {
      const selected = ds.getSelection();
      const filtered = selected.map(el => {
        return {
          slideId: el.getAttribute('data-file-id'),
          slideNo: el.getAttribute('data-iter'),
        };
      });
      const newState = {...this.state, filtered};
      this.setState(newState);
    };
    this.setState({ds});
  };

  componentDidUpdate = this.handleLoad;

  renderSlideTags = (filter, done: false) => {
    if (filter.length === 0) {
      return done ? (
        <kbd>general</kbd>
      ) : (
        'no slides selected, attach as general feedback'
      );
    } else {
      const plural = filter.length > 1;
      const slideNos = filter
        .map(x => parseInt(x.slideNo))
        .sort((a, b) => a - b);
      const slideKeys = slideNos.map(sn => <kbd key={`key-${sn}`}>{sn}</kbd>);
      return (
        <span>
          {!done && <span>attach comment to slide{plural && 's'}</span>}
          {slideKeys}
        </span>
      );
    }
  };

  renderFiles = () => {
    const {_id, files} = this.props;
    return files.map((aFile, key) => {
      let link = Files.findOne({_id: aFile._id}).link('original', '//');
      return (
        <FileReview
          key={'file-' + key}
          iter={key}
          fileUrl={link}
          fileId={aFile._id}
          fileName={aFile.name}
          handleLoad={this.handleLoad}
        />
      );
    });
  };

  renderComments = () => {
    const {comments} = this.props;
    if (!comments || !comments.length) {
      return <div className="alert"> no comments yet</div>;
    } else {
      return comments.map(c => {
        const context = this.renderSlideTags(c.slides, true);
        return (
          <div className="clearfix" key={c._id}>
            <strong>{c.author} </strong>
            {c.content}
            <div className="pull-right"> {context} </div>
          </div>
        );
      });
    }
  };

  render() {
    const {_id, files, name} = this.props;
    const fileList = this.renderFiles();
    const comments = this.renderComments();

    return files ? (
      this.renderRedirect() || (
        <div className="main-content reviewView no-v-pad">
          <h1>
            ‹ <Link to={`/sessions/${_id}`}>{name}</Link>
          </h1>
          <h2>review feedback</h2>
          <div id="grid" className="padded grid">
            {fileList}
          </div>
          <h2>comments</h2>
          {comments}
        </div>
      )
    ) : (
      <div>loading file list...</div>
    );
  }
}

export default FeedbackPage;
