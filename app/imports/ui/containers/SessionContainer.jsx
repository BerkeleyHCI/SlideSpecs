import React from 'react';
import PropTypes from 'prop-types';
import BaseComponent from '../components/BaseComponent.jsx';
import Message from '../components/Message.jsx';
import {Link} from 'react-router-dom';

export default class SessionContainer extends BaseComponent {
  constructor(props) {
    super(props);
  }

  hasFeedback() {
    return false;
  }

  hasSlides() {
    const {files} = this.props;
    return files.length > 0;
  }

  gotoUpload = () => {
    const {_id} = this.props;
    this.redirectTo(`/slides/${_id}`);
  };

  getContent() {
    if (this.hasFeedback()) {
      return <Message title="session" subtitle="has feedback" />;
      // redirect to viewing
    } else if (this.hasSlides()) {
      return (
        <div className="card">
          <img className="card-img-top" src="/" alt="Card image cap" />
          <div className="card-body">
            <h5 className="card-title">Card title</h5>
            <p className="card-text">
              Some quick example text to build on the card title and make up the
              bulk of the card's content.
            </p>
            <a href="#" className="btn btn-primary">
              Go somewhere
            </a>
          </div>
        </div>
      );
      // redirect to link sharing, code generation
    } else {
      return <Message title="no slides yet" subtitle="add above" />;
      // redirect to uploading
    }
  }

  render() {
    const {_id, name, files} = this.props;
    return (
      this.renderRedirect() || (
        <div className="main-content">
          <h1> {name} </h1>
          <button onClick={this.gotoUpload} className="btn btn-primary">
            + slides
          </button>
          {this.getContent()}
        </div>
      )
    );
  }
}

SessionContainer.propTypes = {
  user: PropTypes.object, // current meteor user
  _id: PropTypes.string, // current session
  files: PropTypes.array, // current session files
};

SessionContainer.defaultProps = {
  user: null,
  files: [],
};
