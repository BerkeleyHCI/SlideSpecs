import React, {Component} from 'react';
import BaseComponent from '../components/BaseComponent.jsx';
import Img from '../components/Image.jsx';

class FileReview extends BaseComponent {
  render() {
    const {iter, fileId, fileUrl, handleLoad, handleMouse} = this.props;
    return (
      <div
        className="file-item file-item-review"
        onMouseOver={handleMouse}
        data-iter={iter}
        data-file-id={fileId}>
        <div className="slide-container">
          <div className="overlay">{iter}</div>
          <Img className="slide" source={fileUrl} onLoad={handleLoad} />
        </div>
      </div>
    );
  }
}
export default FileReview;
