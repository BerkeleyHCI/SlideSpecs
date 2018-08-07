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

  renderFeedback = () => {
    return <Message title="session" subtitle="has feedback" />;
  };

  renderSlides = () => {
    return (
      <div className="padded card">
        <pre>
          <code>
            &lt;p&gt;Sample text here...&lt;/p&gt; &lt;p&gt;And another line of
            sample text here...&lt;/p&gt;
          </code>
        </pre>
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
  };

  renderUpload = () => {
    const gotoUpload = () => {
      const {_id} = this.props;
      const uLink = `/slides/${_id}`
      return <Redirect to={uLink} />
    };

  render() {
    let content;
    const {_id, name, files} = this.props;
    if (this.hasFeedback()) {
      content = this.renderFeedback(); // redirect to viewing
    } else if (this.hasSlides()) {
      content = this.renderSlides(); // redirect to link sharing, code generation
    } else {
      content = this.renderUpload(); // redirect to uploading
    }
    return (
      this.renderRedirect() || (
        <div className="main-content">
          <h1> {name} </h1>
          {content}
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
