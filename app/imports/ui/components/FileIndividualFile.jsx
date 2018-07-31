import React, {Component} from 'react';

class IndividualFile extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.removeFile = this.removeFile.bind(this);
    this.renameFile = this.renameFile.bind(this);
  }

  removeFile() {
    Meteor.call('files.remove', {fileId: this.props.fileId}, function(
      err,
      res,
    ) {
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
      Meteor.call(
        'files.rename',
        {fileId: this.props.fileId, newName: prompt},
        function(err, res) {
          if (err) console.log(err);
        },
      );
    }
  }

  render() {
    return (
      <div className="slide-container">
        <h4>
          {this.props.fileName} <small> {this.props.fileSize}</small>
        </h4>
        <div className="">
          <button className="btn-primary float-right" onClick={this.renameFile}>
            Rename
          </button>
          <button className="btn-primary float-right" onClick={this.removeFile}>
            Delete
          </button>
        </div>
        <img className="slide" src={this.props.fileUrl} />
      </div>
    );
  }
}
export default IndividualFile;
