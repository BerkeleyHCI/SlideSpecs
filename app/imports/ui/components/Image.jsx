import React, {Component} from 'react';
import PropTypes from 'prop-types';

class Img extends Component {
  constructor(props) {
    super(props);
    this.state = {fail: false};
  }

  handleLoad = () => {
    const {source} = this.props;
    this.setState({source});
  };

  handleError = () => {
    this.setState({fail: true});
  };

  render() {
    const {fail} = this.state;
    const {source, err, ...o} = this.props;
    const file = fail ? err : source;
    return <img src={file} onError={this.handleError} {...o} />;
  }
}

Img.propTypes = {
  source: PropTypes.string.isRequired,
  err: PropTypes.string, // backup img
};

Img.defaultProps = {
  source: '/default.png',
  err: '/default.png',
};

export default Img;
