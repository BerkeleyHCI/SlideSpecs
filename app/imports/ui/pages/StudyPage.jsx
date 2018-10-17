import {Meteor} from 'meteor/meteor';
import React, {Component} from 'react';
import {Link} from 'react-router-dom';

// LINK STUDY PAGE FOR ARVR CLASS 9/12
// note: updated for class on 10/17

const StudyPageLink = (link, i) => {
  return (
    <li key={`link-${i}`}>
      <Link to={`/share/${link}`}> presentation {i + 1} </Link>
    </li>
  );
};

class StudyPage extends Component {
  render() {
    // for 9/12
    //const linkIds = [
    //'sekvKeDoovKogBpJE',
    //'DBqSqEwmqjhomvP24',
    //'wZvSA8jh93WW2Ytqn',
    //'ccE6XkL2iRRbj9dkK',
    //'NBxpCTWSK4ik2kekM',
    //'KnsJK63N3f9vneyqy',
    //'m4h8GN8HyvAFsLBWm',
    //'4sHvcTKNR8H49Qxoe',
    //'SL2u4b47BsJK5C6rg',
    //'d9ePEZwoA4vvioqR2',
    //'LWTejnPdPjv6G7dub',
    //'tkK5wHfomfjR79yJk',
    //'c2aYLAoHzfTiXmWRX',
    //];

    // for 10/17
    const linkIds = [
      'rc9hj8ccnFMR7Xrrc', // group 1
      'ormbW5fLWdwb9uJhn',
      'NQyqNmFjjLnT7G4K6',
      'wkosB2emHrdLtbyf8',
      '8See5hFhZrk5m3E8M',
      'R2Kf5cMQZkKQ7eupZ',
      'ty8FMobbtxR6sEnKz',
      'u72H322FYyp5uT4Ez',
      '6BdoZffPNbpWrToXA',
      '4CPNqDYbzuCsuDZiT',
      'bqGqonWpF5LNSbSHC',
      'hbGYCjxKMLTE3cgSk',
      'dXYn8TdRpx9go4d5p',
      'tTNWCMxQ55qe5acpx',
      '4gHRkSXo4kEA87FGK',
      'QNyRENSd4PJncxLSb',
      'AvcopdT6TLdh4Jz5E', // group 17
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
