import React from 'react';
import PropTypes from 'prop-types';
import {Session} from 'meteor/session.js';
import BaseComponent from '../components/BaseComponent.jsx';

export default class SessionContainer extends BaseComponent {
  renewSubscription = _id => {
    const sub = Session.get('subscription');
    return _id && (!sub || sub.type != 'session' || sub._id != _id);
  };

  getSessionProps = _id => {
    if (this.renewSubscription(_id)) {
      Session.set('subscription', {type: 'session', _id});
    }

    let props = {};
    const {sessions, talks, files, images, comments} = this.props;
    props.session = sessions.find(s => s._id === _id) || {};
    props.talks = talks.filter(f => f.session === _id);
    props.files = files.filter(f => f.meta.sessionId === _id);
    props.images = images.filter(f => f.meta.sessionId === _id);
    props.sessionOwner = Meteor.userId() === props.session.userId;
    props.name = props.session.name;
    props.sessionId = _id;
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
