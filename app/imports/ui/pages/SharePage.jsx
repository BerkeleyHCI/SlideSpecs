import {Meteor} from 'meteor/meteor';
import React, {Component} from 'react';
import {Link} from 'react-router-dom';

import BaseComponent from '../components/BaseComponent.jsx';
import MenuContainer from '../containers/MenuContainer.jsx';
import {FullMessage} from '../components/Message.jsx';
import NameSet from '../components/NameSet.jsx';

class SharePage extends BaseComponent {
  renderTalk = (talk, i) => {
    return (
      <li className="list-group-item clearfix">
        <Link key={talk._id} to={`/comment/${talk._id}`}>
          {i + 1}. {talk.name}
        </Link>
      </li>
    );
  };

  renderName = () => {
    if (Session.get('reviewer')) {
      return null;
    } else {
      return <NameSet />;
    }
  };

  render() {
    const {name, talks} = this.props;
    const renderedTalks = talks.map(this.renderTalk);
    const content = this.renderName() || (
      <div className="main-content">
        <h1>{name}</h1>
        {talks.length == 0 && <div className="alert">no talks yet</div>}
        {talks.length > 0 && (
          <div>
            <ul className="v-pad list-group">{renderedTalks}</ul>
          </div>
        )}
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
