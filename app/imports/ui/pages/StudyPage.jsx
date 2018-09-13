import {Meteor} from 'meteor/meteor';
import React, {Component} from 'react';
import {Link} from 'react-router-dom';

// LINK STUDY PAGE FOR ARVR CLASS 9/12

const StudyPageLink = (link, i) => {
  return (
    <li key={`link-${i}`}>
      <Link to={`/share/${link}`}> presentation {i + 1} </Link>
    </li>
  );
};

class StudyPage extends Component {
  render() {
    const linkIds = [
      'sekvKeDoovKogBpJE',
      'DBqSqEwmqjhomvP24',
      'wZvSA8jh93WW2Ytqn',
      'ccE6XkL2iRRbj9dkK',
      'NBxpCTWSK4ik2kekM',
      'KnsJK63N3f9vneyqy',
      'm4h8GN8HyvAFsLBWm',
      '4sHvcTKNR8H49Qxoe',
      'SL2u4b47BsJK5C6rg',
      'd9ePEZwoA4vvioqR2',
      'LWTejnPdPjv6G7dub',
      'tkK5wHfomfjR79yJk',
      'c2aYLAoHzfTiXmWRX',
    ];

    return (
      <div className="main-content">
        <h1>feedback</h1>
        <h2>instructions</h2>
        <div className="alert">
          please give feedback for each group's presentation.
          <br />
          <br />
          you can attach feedback to specific slides and use #tags to label
          comments.
        </div>
        <h2>presentations</h2>
        <div className="alert">
          <ul> {linkIds.map(StudyPageLink)} </ul>
          <br />
        </div>
      </div>
    );
  }
}

export default StudyPage;
