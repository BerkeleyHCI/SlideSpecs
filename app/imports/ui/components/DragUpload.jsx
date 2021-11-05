import React from 'react';
import PropTypes from 'prop-types';
import DropToUpload from 'react-drop-to-upload';
import BaseComponent from './BaseComponent.jsx';
import {FullMessage} from './Message.jsx';

class DragUpload extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {uploading: false, hover: false};
  }

  handleOver = () => {
    this.setState({hover: true});
  };

  handleLeave = () => {
    this.setState({hover: false});
  };

  handleDrop = files => {
    const {handleUpload} = this.props;
    this.setState({hover: false, uploading: true});
    handleUpload(files);
  };

  handleDropArrayBuffer = (arrayBuffers, files) => {
    console.log(arrayBuffers, files); // TODO
  };

  handleDropDataURI = (dataURIs, files) => {
    console.log(dataURIs, files); // TODO
  };

  render() {
    const {title, subtitle} = this.props;
    const dClass = 'dragUpload ' + (this.state.hover ? 'hovered' : '');
    return (
      <DropToUpload
        className={dClass}
        onLeave={this.handleLeave}
        onOver={this.handleOver}
        onDrop={this.handleDrop}>
        <FullMessage
          className={dClass}
          title="drop files here"
          subtitle="PDF only"
        />
      </DropToUpload>
    );
  }
}

//subtitle="PDF or PowerPoint"

DragUpload.defaultProps = {
  title: 'drop files here',
  subtitle: 'PDF only',
};

DragUpload.propTypes = {
  handleUpload: PropTypes.func.isRequired,
};

export default DragUpload;
