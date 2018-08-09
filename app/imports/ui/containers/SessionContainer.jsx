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

  copyUrl = () => {
    var copyText = document.getElementsByClassName('code')[0];
    if (copyText) {
      copyText.select();
      document.execCommand('copy');
    }
  };

  render() {
    const {_id, name, files, comments} = this.props;
    const shareLink = window.location.host + '/share/' + _id;
    const uLink = `/slides/${_id}`;
    const fLink = `/feedback/${_id}`;

    return (
      this.renderRedirect() || (
        <div className="main-content">
          <h1> {name} </h1>
          <div className="padded">
            <div className="alert">
              <h3>
                1. review slides <small>{files.length} slides</small>
              </h3>
              manage the slides for this presentation session [<Link to={uLink}>
                here
              </Link>]
            </div>

            <div className="alert">
              <h3>2. present slides</h3>
              share this link with the audience to collect their feedback.
              <hr />
              <input type="text" value={shareLink} className="code" readOnly />
              <hr />
              <div className="btns-group">
                <button className="btn btn-menu" onClick={this.copyUrl}>
                  copy url
                </button>
              </div>
              <hr />
              once ready, give your presentation. feedback can be accessed
              below.
            </div>
          </div>

          <div className="alert">
            <h3>
              3. review feedback <small>{comments.length} comments</small>
            </h3>
            after your presentation, review the gathered feedback [<Link
              to={fLink}>
              here
            </Link>]
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
