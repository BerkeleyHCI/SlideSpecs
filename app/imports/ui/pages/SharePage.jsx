import React from 'react';
import {Session} from 'meteor/session.js';
import BaseComponent from '../components/BaseComponent.jsx';
import MenuContainer from '../containers/MenuContainer.jsx';
import TalkListItem from '../components/TalkListItem.jsx';
import NameSet from '../components/NameSet.jsx';
import {Link} from 'react-router-dom';

class SharePage extends BaseComponent {
  renderName = () => {
    if (Session.get('reviewer')) {
      return null;
    } else {
      return <NameSet />;
    }
  };

  renderTalks = () => {
    const {talks, images} = this.props;
    return (
      <div>
        <ul className="v-pad list-group">
          {talks.map(talk => (
            <TalkListItem
              key={talk._id}
              talk={talk}
              images={images}
              linkPre="comment"
            />
          ))}
        </ul>
      </div>
    );
  };

  renderOwner = () => {
    const {session} = this.props;
    return (
      <div className="alert">
        <small className="pull-right">
          <i>You own this session; only you see this message.</i>
        </small>
        Share this link to let the audience review the talk slides.
        <hr />
        <code>{window.location.href}</code>
        <hr />
        <Link to={`/sessions/${session._id}`}>
          <span className="black"> ‹ </span>
          Go back to the session management panel.
        </Link>
      </div>
    );
  };

  render() {
    const {name, talks, sessionOwner} = this.props;
    const content = this.renderName() || (
      <div className="main-content">
        <h1>{name}</h1>
        {sessionOwner && this.renderOwner()}
        {talks.length == 0 && <div className="alert">no talks yet</div>}
        {talks.length > 0 && this.renderTalks()}
      </div>
    );

    return (
      this.renderRedirect() || (
        <MenuContainer {...this.props} content={content} />
      )
    );
  }
}

//<div className="alert">
//Please give feedback for each group's presentation.
//<hr />
//You can attach feedback to specific slides and use #tags to label
//comments.
//</div>

export default SharePage;
