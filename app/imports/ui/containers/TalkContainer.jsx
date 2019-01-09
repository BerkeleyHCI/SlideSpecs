import React from 'react';
import PropTypes from 'prop-types';
import {Session} from 'meteor/session.js';
import BaseComponent from '../components/BaseComponent.jsx';
import ReviewContainer from '../containers/ReviewContainer.jsx';

export default class TalkContainer extends BaseComponent {
  controlFilter = comment => {
    const auth = ['system', this.props.reviewer];
    return (
      !comment.userOwn || (comment.userOwn && auth.includes(comment.author))
    );
  };

  getTalkProps = tid => {
    const storedTalk = Session.get('talk');
    Session.set('session', null);
    const {sessions, talks, reviewer, files, images, comments} = this.props;
    if (tid && (!storedTalk || storedTalk !== tid)) {
      Session.set('talk', tid);
    }
    const talk = talks.find(t => t._id === tid) || {};
    console.log(talks, tid, talk);
    Session.set('session', talk.session);

    let props = {};
    props.talk = talk;
    props.sessionId = talk.session;
    props.session = sessions.find(s => s._id === talk.sessionId);
    props.tComments = comments.filter(c => c.talk === tid);
    props.comments = props.tComments.filter(this.controlFilter);
    props.files = files.filter(f => f.meta.talkId === tid);
    props.images = images.filter(f => f.meta.talkId === tid);
    props.reviewer = reviewer;
    props.talkId = tid;
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
