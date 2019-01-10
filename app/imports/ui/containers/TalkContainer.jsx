import React from 'react';
import PropTypes from 'prop-types';
import {Session} from 'meteor/session.js';
import BaseComponent from '../components/BaseComponent.jsx';
import ReviewContainer from '../containers/ReviewContainer.jsx';

export default class TalkContainer extends BaseComponent {
  renewSubscription = _id => {
    const sub = Session.get('subscription');
    return _id && (!sub || sub.type != 'user' || sub._id != _id);
  };

  controlFilter = comment => {
    const auth = ['system', this.props.reviewer];
    return (
      !comment.userOwn || (comment.userOwn && auth.includes(comment.author))
    );
  };

  getTalkProps = _id => {
    if (this.renewSubscription(_id)) {
      Session.set('subscription', {type: 'talk', _id});
    }

    let props = {};
    const {sessions, talks, reviewer, files, images, comments} = this.props;
    props.talk = talks.find(t => t._id === _id) || {};
    props.session = sessions.find(s => s._id === props.talk.session) || {};
    props.tComments = comments.filter(c => c.talk === _id);
    props.comments = props.tComments.filter(this.controlFilter);
    props.files = files.filter(f => f.meta.talkId === _id);
    props.images = images.filter(f => f.meta.talkId === _id);
    props.sessionId = props.session._id;
    props.name = props.talk.name;
    props.reviewer = reviewer;
    props.talkId = _id;
    return props;
  };

  render() {
    const {id, Comp} = this.props;
    const talkProps = this.getTalkProps(id);
    return (
      this.renderRedirect() || (
        <ReviewContainer Comp={Comp} {...this.props} {...talkProps} />
      )
    );
  }
}

TalkContainer.propTypes = {
  id: PropTypes.string.isRequired,
};
