import React, {Component} from 'react';

class FileReview extends Component {
  addComment = () => {
    console.log('comment');
  };

  render() {
    const {iter, fileId, fileUrl, handleLoad} = this.props;
    return (
      <div
        className="file-item file-item-review"
        data-iter={iter}
        data-file-id={fileId}>
        <img className="slide" onLoad={handleLoad} src={fileUrl} />
      </div>
    );
  }
}
export default FileReview;
