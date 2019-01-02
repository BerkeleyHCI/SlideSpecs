import React from 'react';
import PropTypes from 'prop-types';
import BaseComponent from '../components/BaseComponent.jsx';
import MenuContainer from '../containers/MenuContainer.jsx';
import AppNotification from '../components/AppNotification.jsx';
import {Message} from '../components/Message.jsx';
import {toast} from 'react-toastify';
import {Link} from 'react-router-dom';

export default class SessionPage extends BaseComponent {
  componentDidMount = () => {
    const {sessionId, files} = this.props;
    const uLink = `/slides/${sessionId}`;
    if (files.length === 0) {
      this.redirectTo(uLink);
    }
  };

  copyComment = () => {
    this.copyCodeUrl(0);
  };

  copyDiscuss = () => {
    this.copyCodeUrl(1);
  };

  copyCodeUrl = idx => {
    var copyText = document.getElementsByClassName('code')[idx];
    const uType = idx == 0 ? 'comment' : 'discussion';
    if (copyText) {
      copyText.select();
      document.execCommand('copy');
      this.clearSelection();
      toast(() => (
        <AppNotification
          msg={`${uType} link copied`}
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
    const discussCount = sComments.filter(
      sc => (sc.discuss || []).length > 0 && !sc.addressed,
    ).length; // back portability

    const shareLink = window.location.origin + '/share/' + sessionId;
    const discussLink = window.location.origin + '/discuss/' + sessionId;
    const uLink = `/slides/${sessionId}`;
    const dLink = `/discuss/${sessionId}`;
    const fLink = `/feedback/${sessionId}`;
    const content = (
      <div className="main-content">
        <h1> {name} </h1>
        <div className="v-pad">
          <div className="alert">
            <h3>
              slide review <small>{files.length} slides</small>
            </h3>
            manage the slides for this presentation session [
            <Link to={uLink}>here</Link>]
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

SessionPage.propTypes = {
  user: PropTypes.object, // current meteor user
  sessionId: PropTypes.string, // current session
  files: PropTypes.array, // current session files
};

SessionPage.defaultProps = {
  user: null,
  files: [],
};
