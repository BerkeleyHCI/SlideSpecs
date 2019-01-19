import React from 'react';
import PropTypes from 'prop-types';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session.js';
import BaseComponent from '../components/BaseComponent.jsx';
import AuthPageSignIn from '../pages/AuthPageSignIn.jsx';
import AuthPageJoin from '../pages/AuthPageJoin.jsx';

export default class SpeakerContainer extends BaseComponent {
  handleNoUser = () => {
    if (!Meteor.user() || Meteor.loggingIn()) {
      //return this.redirectTo(`/join?next=${window.location.origin}`);
    }
  };

  componentDidMount = this.handleNoUser;
  componentDidUpdate = this.handleNoUser;

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
    //props.session = sessions.find(s => s.secret === _id) || {};
    props.session = sessions.find(s => s._id === _id) || {};
    props.talk = talks.find(
      f => f.session == _id && f.userId == Meteor.userId(),
    );
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

SpeakerContainer.propTypes = {
  id: PropTypes.string.isRequired,
};
