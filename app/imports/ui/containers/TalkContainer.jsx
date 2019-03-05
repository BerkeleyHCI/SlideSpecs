import React from 'react';
import PropTypes from 'prop-types';
import {Session} from 'meteor/session.js';
import BaseComponent from '../components/BaseComponent.jsx';
import ReviewContainer from '../containers/ReviewContainer.jsx';

export default class TalkContainer extends BaseComponent {
  renewSubscription = _id => {
    const sub = Session.get('subscription');
    return _id && (!sub || sub.type != 'talk' || sub._id != _id);
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
    const {talks, reviewer, files, images, comments} = this.props;
    props.talk = talks.find(t => t._id === _id) || {};
    props.file = files.find(f => f.meta.talkId === _id);
    props.comments = comments.filter(c => c.talk === _id);
    //props.comments = props.comments.filter(this.controlFilter);
    props.images = images.filter(f => f.meta.talkId === _id);
    props.name = props.talk.name;
    props.reviewer = reviewer;
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
