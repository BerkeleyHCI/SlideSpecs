import {Meteor} from 'meteor/meteor';
import React, {Component} from 'react';
import {Link} from 'react-router-dom';

// LINK STUDY PAGE FOR ARVR CLASS 9/12

const StudyPageLink = ({}) => {
  return null;
};

class StudyPage extends Component {
  render() {
    return (
      <div className="main-content">
        <h1>feedback</h1>
        <h2>instructions</h2>
        <div className="alert">please give feedback</div>
        <h2>presentations</h2>
        <div className="alert">links to all of the presentations</div>
        <h2>survey</h2>
        <div className="alert">
          Post-presentations survey:{' '}
          <Link to="https://docs.google.com/forms/d/1wJghymokLHhEdHEKrRU1FLfkY99G-qNbDt_p4tQsrXA/">
            link
          </Link>
        </div>
      </div>
    );
  }
}

export default StudyPage;
