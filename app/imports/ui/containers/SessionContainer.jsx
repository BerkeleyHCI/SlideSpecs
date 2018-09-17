import React from 'react';
import PropTypes from 'prop-types';
import BaseComponent from '../components/BaseComponent.jsx';
import MenuContainer from '../containers/MenuContainer.jsx';
import AppNotification from '../components/AppNotification.jsx';
import Message from '../components/Message.jsx';
import {toast} from 'react-toastify';
import {Link} from 'react-router-dom';

export default class SessionContainer extends BaseComponent {
  componentDidMount = () => {
    const {sessionId, files} = this.props;
    const uLink = `/slides/${sessionId}`;
    if (files.length === 0) {
      this.redirectTo(uLink);
    }
  };

  copyUrl = () => {
    var copyText = document.getElementsByClassName('code')[0];
    if (copyText) {
      copyText.select();
      document.execCommand('copy');
      this.clearSelection();
      toast(() => (
        <AppNotification
          msg="link copied"
          desc="copied to clipboard"
          icon="check"
        />
      ));
    }
  };

  clearSelection = () => {
    if (window.getSelection) {
      window.getSelection().removeAllRanges();
    } else if (document.selection) {
      document.selection.empty();
    }
  };

  render() {
    const {sessionId, name, files, sComments} = this.props;
    const discussCount = sComments.filter(sc => sc.discuss.length > 0).length;
    const shareLink = window.location.origin + '/share/' + sessionId;
    const uLink = `/slides/${sessionId}`;
    const dLink = `/discuss/${sessionId}`;
    const fLink = `/feedback/${sessionId}`;
    const content = (
      <div className="main-content">
        <h1> {name} </h1>
        <div className="v-pad">
          <div className="alert">
            <h3>
              1. review slides <small>{files.length} slides</small>
            </h3>
            manage the slides for this presentation session [
            <Link to={uLink}>here</Link>]
          </div>

          <div className="alert">
            <h3>2. present slides</h3>
            share this link with the audience to collect their feedback.
            <hr />
            <input type="text" value={shareLink} className="code" readOnly />
            <hr />
            <button className="btn btn-primary" onClick={this.copyUrl}>
              copy link
            </button>
            <a className="btn btn-danger" href={shareLink} target="_blank">
              open link
            </a>
            <hr />
            once ready, give your presentation.
          </div>

          <div className="alert">
            <h3>
              3. discuss feedback{' '}
              <small>{discussCount} comments to discuss</small>
            </h3>
            after your presentation, discuss audience-selected comments [
            <Link to={dLink}>here</Link>]
          </div>

          <div className="alert">
            <h3>
              4. review feedback{' '}
              <small>{sComments.length} total comments</small>
            </h3>
            last, review all gathered feedback [<Link to={fLink}>here</Link>]
          </div>
        </div>
      </div>
    );

    return (
      this.renderRedirect() || (
        <MenuContainer {...this.props} content={content} />
      )
    );
  }
}

SessionContainer.propTypes = {
  user: PropTypes.object, // current meteor user
  sessionId: PropTypes.string, // current session
  files: PropTypes.array, // current session files
};

SessionContainer.defaultProps = {
  user: null,
  files: [],
};
