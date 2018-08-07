import React from 'react';
import PropTypes from 'prop-types';
import BaseComponent from '../components/BaseComponent.jsx';
import Message from '../components/Message.jsx';
import {Link} from 'react-router-dom';

export default class SessionContainer extends BaseComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount = () => {
    const {_id, files} = this.props;
    const uLink = `/slides/${_id}`;
    if (files.length === 0) {
      this.redirectTo(uLink);
    }
  };

  render() {
    const {_id, name, files} = this.props;
    const uLink = `/slides/${_id}`;
    const copyUrl = () => {
      var copyText = document.getElementByClass('code');
      copyText.select();
      document.execCommand('copy');
    };

    return (
      this.renderRedirect() || (
        <div className="main-content">
          <h1> {name} </h1>
          <div className="padded">
            <div className="alert">
              <h3>1. upload slides</h3>
              manage the slides for this presentation session
              <Link to={uLink}> here</Link>
            </div>

            <div className="alert">
              <h3>2. present slides</h3>
              once the slides are uploaded, share this link with the audience
              for review
              <br />
              <input type="text" value="google.com" className="code" readonly />
              <button onClick={copyUrl}>copy url</button>
            </div>
          </div>

          <div className="alert">
            <h3>3. review feedback</h3>
            after your presentation, review the gathered feedback
            <Link to="/"> here</Link>
          </div>
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
