import {Meteor} from 'meteor/meteor';
import React, {Component} from 'react';
import BaseComponent from '../components/BaseComponent.jsx';
import MenuContainer from '../containers/MenuContainer.jsx';
import {Link} from 'react-router-dom';

const SharePageLink = talk => {
  return (
    <li key={talk._id}>
      <Link to={`/review/${talk._id}`}>{talk.name}</Link>
    </li>
  );
};

class SharePage extends BaseComponent {
  render() {
    const {name, talks} = this.props;
    const content = (
      <div className="main-content">
        <h1>{name}</h1>
        <h3>instructions</h3>
        <div className="alert">
          Please give feedback for each group's presentation.
          <hr />
          You can attach feedback to specific slides and use #tags to label
          comments.
        </div>
        <div className="alert">
          <ol>{talks.map(SharePageLink)}</ol>
          {talks.length == 0 && 'no talks yet'}
        </div>
      </div>
    );

    return (
      this.renderRedirect() || (
        <MenuContainer {...this.props} content={content} />
      )
    );
  }
}

export default SharePage;
