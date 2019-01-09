import React from 'react';
import {Session} from 'meteor/session.js';
import PropTypes from 'prop-types';
import BaseComponent from '../components/BaseComponent.jsx';

export default class SessionContainer extends BaseComponent {
  getSessionProps = sid => {
    const storedSession = Session.get('session');
    if (sid && (!storedSession || storedSession !== sid)) {
      Session.set('session', sid);
    }

    Session.set('talk', null);
    const {sessions, reviewer, talks, files, images, comments} = this.props;
    let props = sessions.find(s => s._id === sid) || {};
    props.talks = talks.filter(f => f.session === sid);
    props.files = files.filter(f => f.meta.sessionId === sid);
    props.images = images.filter(f => f.meta.sessionId === sid);
    props.reviewer = reviewer;
    props.sessionId = sid;
    return props;
  };

  render() {
    const {id, Comp} = this.props;
    let sessionProps = this.getSessionProps(id);
    return this.renderRedirect() || <Comp {...this.props} {...sessionProps} />;
  }
}

SessionContainer.propTypes = {
  id: PropTypes.string.isRequired,
};
