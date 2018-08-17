import {Meteor} from 'meteor/meteor';
import React, {Component} from 'react';
import {withTracker} from 'meteor/react-meteor-data';
import {Link} from 'react-router-dom';
import _ from 'lodash';

import {Files} from '../../api/files/files.js';
import BaseComponent from '../components/BaseComponent.jsx';
import FileReview from '../components/FileReview.jsx';
import Message from '../components/Message.jsx';
import Comment from '../components/Comment.jsx';
import {createComment} from '../../api/comments/methods.js';

class SlideReviewPage extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      redirectTo: null,
      sorter: 'created',
      invert: false,
      filtered: [],
      selected: [],
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
    let {ds, selected} = this.state;
    if (ds) {
      ds.selectables = elements;
    } else {
      ds = new DragSelect({selectables: elements});
      const updateSelection = () => {
        const s = ds.getSelection();
        if (s.length > 0) {
          const filtered = s.map(x => {
            return {
              slideId: x.getAttribute('data-file-id'),
              slideNo: x.getAttribute('data-iter'),
            };
          });
          this.setState({selected: s, filtered});
        } else {
          ds.addSelection(selected);
        }
      };
      ds.callback = updateSelection;
      ds.onDragMove = updateSelection;
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
    const copyText = document.getElementsByClassName('code')[0];
    if (copyText) {
      return copyText.value;
    } else {
      return '';
    }
  };

  clearText = () => {
    const copyText = document.getElementsByClassName('code')[0];
    copyText.value = '';
    copyText.focus();
  };

  clearSelection = e => {
    this.setState({filtered: [], selected: []});
  };

  clearGrid = e => {
    event.preventDefault();
    if (event.target === event.currentTarget) {
      this.clearSelection();
    }
  };

  addComment = e => {
    const {reviewer, sessionId} = this.props;
    const slides = this.state.filtered;
    const cText = this.getText().trim();
    const commentFields = {
      author: reviewer,
      content: cText,
      session: sessionId,
      slides,
    };

    if (cText && e.keyCode === 13 && !e.shiftKey) {
      createComment.call(commentFields, (err, res) => {
        if (err) {
          console.error(err);
        } else {
          this.clearSelection();
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
          {!done && (
            <button
              onClick={this.clearSelection}
              className="btn btn-menu pull-right">
              clear
            </button>
          )}
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
        <textarea
          type="text"
          placeholder="write comment here, press enter to submit."
          onKeyDown={this.addComment}
          className="code"
        />
      </div>
    );
  };

  renderFiles = () => {
    const {files} = this.props;
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
    const {sorter, invert} = this.state;
    const {comments} = this.props;
    if (!comments || !comments.length) {
      return <div className="alert"> no comments yet</div>;
    } else {
      let ssort = _.sortBy(comments, 'created'); // default
      let csort = _.sortBy(comments, sorter);
      if (invert) {
        csort = csort.reverse();
      }

      return csort.map(c => {
        const context = this.renderSlideTags(c.slides, true);
        return <Comment key={c._id} {...c} context={context} />;
      });
    }
  };

  //setsSort = s => {s};

  render() {
    const {files} = this.props;
    const {invert} = this.state;
    const submitter = this.renderSubmit();
    const fileList = this.renderFiles();
    const comments = this.renderComments();
    const invFn = () => this.setState({invert: !invert});
    const setSort = s => {
      return () => this.setState({sorter: s});
    };

    return files ? (
      this.renderRedirect() || (
        <div className="reviewView">
          <h1>share feedback</h1>
          <div
            id="grid"
            onMouseDown={this.clearGrid}
            className="padded clearfix">
            {fileList}
          </div>
          {submitter}
          <h2 className="clearfix">
            comments
            <div className="pull-right">
              <button onClick={setSort('created')} className="btn btn-menu">
                by time
              </button>
              <button
                className="btn btn-menu"
                onClick={setSort(x => x.author.toLowerCase())}>
                by author
              </button>
              <button
                className="btn btn-menu"
                onClick={setSort(x => {
                  return x.slides[0] ? Number(x.slides[0].slideNo) : Infinity;
                })}>
                by slide
              </button>
              <button className="btn btn-menu" onClick={invFn}>
                order {invert ? '▼' : '▲'}
              </button>
            </div>
          </h2>
          {comments}
        </div>
      )
    ) : (
      <div>loading file list...</div>
    );
  }
}

export default SlideReviewPage;
