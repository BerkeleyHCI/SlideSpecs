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
      console.log(filtered);
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
    if (copyText) {
      return (copyText.value = '');
    } else {
      return '';
    }
  };

  addComment = () => {
    const cText = this.getText();
    console.log(cText);
    this.clearText();
    //addComment.call('name', name);
  };

  renderComment = () => {
    return (
      <div className="alert">
        <h3>enter your feedback:</h3>
        <hr />
        <input
          type="text"
          defaultValue="your name"
          className="code"
          onSubmit={this.setName}
        />
        <hr />
        <div className="btns-group">
          <button onClick={this.setName} className="btn btn-menu">
            set name
          </button>
        </div>
      </div>
    );
  };

  render() {
    const {_id, name, files} = this.props;
    const commenter = this.renderComment();
    if (files) {
      let display = files.map((aFile, key) => {
        let link = Files.findOne({_id: aFile._id}).link();
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

      return (
        this.renderRedirect() || (
          <div className="reviewView">
            <h2>comment</h2>
            {commenter}
            <h2>slides view</h2>
            <div id="grid" className="padded grid">
              {display}
            </div>
          </div>
        )
      );
    } else return <div>loading file list...</div>;
  }
}

export default SlideReviewPage;
