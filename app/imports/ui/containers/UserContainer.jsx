import React from 'react';
import PropTypes from 'prop-types';
import {Session} from 'meteor/session.js';
import BaseComponent from '../components/BaseComponent.jsx';

export default class UserContainer extends BaseComponent {
  renewSubscription = uid => {
    const sub = Session.get('subscription');
    return uid && (!sub || sub.type != 'user' || sub._id != uid);
  };

  getUserProps = uid => {
    if (this.renewSubscription(uid)) {
      Session.set('subscription', {type: 'user', _id: uid});
    }

    let props = {};
    const {sessions, talks, files, images, comments} = this.props;
    props.sessions = sessions.filter(s => s.userId === sid);
    props.talks = talks.filter(f => f.userId === uid);
    props.comments = comments.filter(f => f.userId === uid);
    props.files = files.filter(f => f.meta.userId === uid);
    props.images = images.filter(f => f.meta.userId === uid);
    return props;
  };

  render() {
    const {id, Comp, ...other} = this.props;
    let userProps = this.getUserProps(id);
    return this.renderRedirect() || <Comp {...other} {...userProps} />;
  }
}

UserContainer.propTypes = {
  id: PropTypes.string.isRequired,
};
