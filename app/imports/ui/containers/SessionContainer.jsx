import React from 'react';
import PropTypes from 'prop-types';
import {Session} from 'meteor/session.js';
import BaseComponent from '../components/BaseComponent.jsx';

export default class SessionContainer extends BaseComponent {
  renewSubscription = sid => {
    const sub = Session.get('subscription');
    return sid && sub && (sub.type != 'session' || sub._id != sid);
  };

  getSessionProps = sid => {
    if (this.renewSubscription(sid)) {
      Session.set('subscription', {type: 'session', _id: sid});
    }

    let props = {};
    const {sessions, talks, files, images, comments} = this.props;
    props.session = sessions.find(s => s._id === sid) || {};
    props.talks = talks.filter(f => f.session === sid);
    props.files = files.filter(f => f.meta.sessionId === sid);
    props.images = images.filter(f => f.meta.sessionId === sid);
    props.sessionId = sid;
    return props;
  };

  render() {
    const {id, Comp, ...other} = this.props;
    let sessionProps = this.getSessionProps(id);
    return this.renderRedirect() || <Comp {...other} {...sessionProps} />;
  }
}

SessionContainer.propTypes = {
  id: PropTypes.string.isRequired,
};
