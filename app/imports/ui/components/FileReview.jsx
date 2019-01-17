import React from 'react';
import BaseComponent from '../components/BaseComponent.jsx';
import Img from '../components/Image.jsx';
import PropTypes from 'prop-types';

class FileReview extends BaseComponent {
  render() {
    const {
      iter,
      active,
      fileId,
      fileUrl,
      slideCount,
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
          {slideCount > 0 && (
            <div className="slide-overlay">
              {slideCount} <i className="fa fa-comments" />
            </div>
          )}
          <Img className="slide" source={fileUrl} onLoad={handleLoad} />
        </div>
      </div>
    );
  }
}

FileReview.propTypes = {
  slideCount: PropTypes.number,
};

FileReview.defaultProps = {
  slideCount: 0,
};

export default FileReview;
