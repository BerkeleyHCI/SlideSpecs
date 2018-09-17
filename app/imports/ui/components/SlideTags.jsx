import React, {Component} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

class SlideTags extends Component {
  render() {
    const {
      done,
      slides,
      bySlide,
      clearButton,
      setBySlide,
      handleSlideIn,
      handleSlideOut,
    } = this.props;

    const active = sn => (sn === bySlide ? 'active' : '');

    if (slides.length === 0) {
      return done ? (
        <kbd className={active({slideNo: 'general'})} onClick={setBySlide}>
          general
        </kbd>
      ) : null;
    } else {
      const plural = slides.length > 1;
      const slideNos = _.sortBy(slides, x => Number(x.slideNo));
      const slideKeys = slideNos.map(s => (
        <kbd
          className={active(s.slideNo)}
          key={`key-${s.slideNo}`}
          iter={s.slideNo}
          data-file-id={s.slideId}
          onMouseOver={handleSlideIn}
          onMouseOut={handleSlideOut}
          onClick={setBySlide}>
          {s.slideNo}
        </kbd>
      ));
      return (
        <span className="slide-tags">
          {done ? (
            <span>{slideKeys}</span>
          ) : (
            <span>
              <button onClick={clearButton} className="btn btn-menu pull-right">
                clear
              </button>
              attach comment to slide
              {plural && 's'} {slideKeys}
            </span>
          )}
        </span>
      );
    }
  }
}

SlideTags.propTypes = {
  slides: PropTypes.array,
};

SlideTags.defaultProps = {
  slides: [],
  done: false,
};

export default SlideTags;
