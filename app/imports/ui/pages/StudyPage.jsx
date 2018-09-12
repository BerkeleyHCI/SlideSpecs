import {Meteor} from 'meteor/meteor';
import React, {Component} from 'react';
import {Link} from 'react-router-dom';

// LINK STUDY PAGE FOR ARVR CLASS 9/12

const StudyPageLink = (link, i) => {
  return (
    <li key={`link-${i}`}>
      <Link to={`/share/${link}`}> presentation {i} </Link>
    </li>
  );
};

class StudyPage extends Component {
  render() {
    // TODO update me w/ real
    const linkIds = [1, 2, 3];

    return (
      <div className="main-content">
        <h1>feedback</h1>
        <h2>instructions</h2>
        <div className="alert">
          please give feedback for each groups presentation. you can attach
          feedback to specific slides and use tags to label your comments.
        </div>
        <h2>presentations</h2>
        <div className="alert">
          all presentation links
          <ul> {linkIds.map(StudyPageLink)} </ul>
        </div>
        <h2>survey</h2>
        <div className="alert">
          Post-presentations survey: [<a
            target="_blank"
            href="https://docs.google.com/forms/d/1wJghymokLHhEdHEKrRU1FLfkY99G-qNbDt_p4tQsrXA/">
            link
          </a>]
        </div>
      </div>
    );
  }
}

export default StudyPage;
