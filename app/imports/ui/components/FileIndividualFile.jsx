import React, {Component} from 'react';

class IndividualFile extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.removeFile = this.removeFile.bind(this);
    this.renameFile = this.renameFile.bind(this);
  }

  removeFile() {
    Meteor.call('files.remove', this.props.fileId, function(err, res) {
      if (err) console.log(err);
    });
  }

  renameFile() {
    let validName = /[^a-zA-Z0-9 \.:\+()\-_%!&]/gi;
    let prompt = window.prompt('New file name?', this.props.fileName);

    // Replace any non valid characters, also do this on the server
    if (prompt) {
      prompt = prompt.replace(validName, '-');
      prompt.trim();
    }

    if (!_.isEmpty(prompt)) {
      Meteor.call('files.rename', this.props.fileId, prompt, function(
        err,
        res,
      ) {
        if (err) console.log(err);
      });
    }
  }

  render() {
    return (
      <div>
        <a href={this.props.fileUrl} className="btn " target="_blank">
          <strong>{this.props.fileName}</strong>
          <em> {this.props.fileSize}</em>
        </a>

        <button onClick={this.renameFile}>Rename</button>

        <button onClick={this.removeFile}>Delete</button>
      </div>
    );
  }
}
export default IndividualFile;
