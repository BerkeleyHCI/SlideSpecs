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
      console.log(filtered);
    };
    this.setState({ds});
  };

  componentDidUpdate = this.handleLoad;

  humanFileSize(bytes) {
    let fileSizeInBytes = bytes;
    var i = -1;
    var byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
    do {
      fileSizeInBytes = fileSizeInBytes / 1024;
      i++;
    } while (fileSizeInBytes > 1024);
    return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
  }

  render() {
    const {_id, name, files} = this.props;
    if (files) {
      let display = files.map((aFile, key) => {
        let link = Files.findOne({_id: aFile._id}).link();
        return (
          <FileReview
            key={'file-' + key}
            iter={key}
            fileId={aFile._id}
            fileName={aFile.name}
            fileUrl={link}
            fileSize={this.humanFileSize(aFile.size)}
            handleLoad={this.handleLoad}
          />
        );
      });

      return (
        this.renderRedirect() || (
          <div className="reviewView">
            <h1>slides view</h1>
            <div className=" padded grid">{display}</div>
          </div>
        )
      );
    } else return <div>loading file list...</div>;
  }
}

export default SlideReviewPage;
