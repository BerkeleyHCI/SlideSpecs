import React, {Component} from 'react';
import BaseComponent from '../components/BaseComponent.jsx';
import Img from '../components/Image.jsx';

class FileReview extends BaseComponent {
  render() {
    const {
      iter,
      active,
      fileId,
      fileUrl,
      handleLoad,
      handleMouse,
      handleMouseOut,
    } = this.props;
    return (
      <div
        className={'file-item file-item-review ' + (active ? ' active' : '')}
        onMouseOver={handleMouse}
        onMouseOut={handleMouseOut}
        data-iter={iter}
        data-file-id={fileId}>
        <div className="slide-container">
          {active && <div className="live" />}
          <div className="overlay">{iter}</div>
          <Img className="slide" source={fileUrl} onLoad={handleLoad} />
        </div>
      </div>
    );
  }
}
export default FileReview;
