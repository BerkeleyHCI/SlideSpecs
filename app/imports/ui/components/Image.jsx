import React, {Component} from 'react';
import PropTypes from 'prop-types';

class Img extends Component {
  constructor(props) {
    super(props);
    this.state = {fail: false};
  }

  handleError = () => {
    this.setState({fail: true});
  };

  render() {
    const {fail} = this.state;
    const {source, err, ...o} = this.props;
    const file = fail ? err : source;
    return <img src={file} {...o} onError={this.handleError} />;
  }
}

Img.propTypes = {
  source: PropTypes.string.isRequired,
  err: PropTypes.string, // backup img
};

Img.defaultProps = {
  err: '/default.png',
};

export default Img;
