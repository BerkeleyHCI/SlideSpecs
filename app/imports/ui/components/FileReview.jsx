import React, {Component} from 'react';
import BaseComponent from '../components/BaseComponent.jsx';

class FileReview extends BaseComponent {
  render() {
    const {i} = this.state;
    const {iter, fileId, fileUrl, handleLoad} = this.props;
    const err = () => this.setState({i: '/default.png'});
    const img = i ? i : fileUrl;
    return (
      <div
        className="file-item file-item-review"
        data-iter={iter}
        data-file-id={fileId}>
        <div className="slide-container">
          <div className="overlay">{iter}</div>
          <img className="slide" src={img} onLoad={handleLoad} onError={err} />
        </div>
      </div>
    );
  }
}
export default FileReview;
