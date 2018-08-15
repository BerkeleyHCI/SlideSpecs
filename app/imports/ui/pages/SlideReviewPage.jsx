import {Meteor} from 'meteor/meteor';
import React, {Component} from 'react';
import {_} from 'meteor/underscore';
import {withTracker} from 'meteor/react-meteor-data';
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

class SlideReviewPage extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      redirectTo: null,
      filtered: [],
    };
  }

  handleLoad = () => {
    const items = document.querySelectorAll('.file-item');
    const grid = document.getElementById('grid');
    const mason = new Masonry(grid, items);
    mason.on('layoutComplete', this.handleSelectable);
  };

  handleSelectable = items => {
    const area = document.getElementById('grid');
    const elements = items.map(i => i.element);
    let {ds} = this.state;
    if (ds) {
      ds.selectables = elements;
    } else {
      ds = new DragSelect({
        selectables: elements,
      });
      ds.callback = selected => {
        if (selected.length > 0) {
          const filtered = selected.map(x => {
            return {
              slideId: x.getAttribute('data-file-id'),
              slideNo: x.getAttribute('data-iter'),
            };
          });
          this.setState({filtered});
        }
      };
      this.setState({ds});
    }
  };

  elementize = x => {
    return {element: x};
  };

  componentDidUpdate = this.handleLoad;
  componentDidMount = () => {
    this.handleLoad();
    setTimeout(() => {
      const items = document.querySelectorAll('.file-item');
      const nodes = Array.prototype.slice.call(items).map(this.elementize);
      this.handleSelectable(nodes);
    }, 500);
  };

  getText = () => {
    var copyText = document.getElementsByClassName('code')[0];
    if (copyText) {
      return copyText.value;
    } else {
      return '';
    }
  };

  clearText = () => {
    var copyText = document.getElementsByClassName('code')[0];
    copyText.value = '';
  };

  clearSelection = e => {
    const id = e.target.id;
    if (id === 'grid') {
      this.setState({filtered: []});
    }
  };

  addComment = () => {
    const {reviewer, sessionId} = this.props;
    const slides = this.state.filtered;
    const cText = this.getText().trim();
    const commentFields = {
      author: reviewer,
      content: cText,
      session: sessionId,
      slides,
    };

    console.log(commentFields);
    if (cText) {
      createComment.call(commentFields, (err, res) => {
        if (err) {
          console.error(err);
        } else {
          this.clearText();
        }
      });
    }
  };

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

  renderSubmit = () => {
    let {filtered} = this.state;
    let context = this.renderSlideTags(filtered);

    return (
      <div className="alert">
        {context}
        <hr />
        <input
          type="text"
          placeholder="enter comment here"
          className="code"
          onSubmit={this.setName}
        />
        <hr />
        <div className="btns-group">
          <button onClick={this.addComment} className="btn btn-menu">
            share
          </button>
        </div>
      </div>
    );
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
    const {files} = this.props;
    const submitter = this.renderSubmit();
    const fileList = this.renderFiles();
    const comments = this.renderComments();

    return files ? (
      this.renderRedirect() || (
        <div className="reviewView">
          <h1>share feedback</h1>
          <div
            id="grid"
            className="padded clearfix"
            onClick={this.clearSelection}>
            {fileList}
          </div>
          {submitter}
          <h2>comments</h2>
          {comments}
        </div>
      )
    ) : (
      <div>loading file list...</div>
    );
  }
}

export default SlideReviewPage;
