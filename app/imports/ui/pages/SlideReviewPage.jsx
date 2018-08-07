import {Meteor} from 'meteor/meteor';
import React, {Component} from 'react';
import {_} from 'meteor/underscore';
import {withTracker} from 'meteor/react-meteor-data';
import {Link} from 'react-router-dom';

import {Files} from '../../api/files/files.js';
import BaseComponent from '../components/BaseComponent.jsx';
import FileReview from '../components/FileReview.jsx';
import Message from '../components/Message.jsx';

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
    new Masonry('.grid', items);
  };

  componentDidMount = () => {
    this.handleLoad();
    const grid = document.getElementById('grid');
    const items = document.querySelectorAll('.file-item');
    const ds = new DragSelect({selectables: items, area: grid});
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
    copyText.value = 'enter comment';
  };

  addComment = () => {
    const cText = this.getText();
    console.log(cText);
    this.clearText();
    //addComment.call('name', name);
  };

  renderSubmit = () => {
    let context;
    let filter = this.state.filtered;
    if (filter.length === 0)
      context = 'no slides selected, attach as general feedback';
    else {
      const plural = filter.length > 1;
      const slideNos = filter
        .map(x => parseInt(x.slideNo))
        .sort((a, b) => a - b);
      const slideKeys = slideNos.map(sn => <kbd key={`key-${sn}`}>{sn}</kbd>);
      context = (
        <div>
          attach comment to slide{plural && 's'} {slideKeys}
        </div>
      );
    }

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
            submit comment
          </button>
        </div>
      </div>
    );
  };

  renderContext = () => {};

  renderFiles = () => {
    const {_id, files} = this.props;
    return files.map((aFile, key) => {
      const link = Files.findOne({_id: aFile._id}).link();
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

  renderComments = () => {};

  render() {
    const {files} = this.props;
    const submitter = this.renderSubmit();
    const fileList = this.renderFiles();
    const comments = this.renderComments();

    return files ? (
      this.renderRedirect() || (
        <div className="reviewView">
          <h2>submit</h2>
          {submitter}
          <h2>slides</h2>
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

export default SlideReviewPage;
