import React, { Component } from 'react';
import PropTypes from 'prop-types';

class IndividualFile extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.removeFile = this.removeFile.bind(this);
    this.renameFile = this.renameFile.bind(this);
  }

  propTypes: {
    fileName: PropTypes.string.isRequired,
    fileSize: PropTypes.number.isRequired,
    fileUrl: PropTypes.string,
    fileId: PropTypes.string.isRequired
  }

  removeFile(){
    Meteor.call('file.remove', this.props.fileId, function (err, res) {
      if (err)
        console.log(err);
    })
  }

  renameFile(){
    let validName = /[^a-zA-Z0-9 \.:\+()\-_%!&]/gi;
    let prompt    = window.prompt('New file name?', this.props.fileName);

    // Replace any non valid characters, also do this on the server
    if (prompt) {
      prompt = prompt.replace(validName, '-');
      prompt.trim();
    }

    if (!_.isEmpty(prompt)) {
      Meteor.call('file.rename', this.props.fileId, prompt, function (err, res) {
        if (err)
          console.log(err);
      })
    }
  }

  render() {
    return <div className="m-t-sm">
        <strong>{this.props.fileName}</strong>

        <button onClick={this.renameFile} className="btn btn-outline btn-primary btn-sm">
          Rename
        </button>

        <a href={this.props.fileUrl} className="btn btn-outline btn-primary btn-sm"
          target="_blank">View</a>

        <button onClick={this.removeFile} className="btn btn-outline btn-danger btn-sm">
          Delete
        </button>

        <div className="col-md-4">
          Size: {this.props.fileSize}
        </div>
      </div>
      }
      }
      export default IndividualFile;
