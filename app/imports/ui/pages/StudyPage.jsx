import {Meteor} from 'meteor/meteor';
import React, {Component} from 'react';
import {Link} from 'react-router-dom';

// LINK STUDY PAGE FOR ARVR CLASS 9/12
// note: updated for class on 10/17

const StudyPageLink = (d, i) => {
  return (
    <li key={`d.link-${i}`}>
      <Link to={`/share/${d.link}`}>
        Group {i + 1} - {d.name}
      </Link>
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
      {name: 'AR for Visually Impaired', link: 'rc9hj8ccnFMR7Xrrc'},
      {name: 'ARobotics', link: 'ormbW5fLWdwb9uJhn'},
      {name: 'OOPS', link: 'NQyqNmFjjLnT7G4K6'},
      {name: 'OpenRecon', link: 'wkosB2emHrdLtbyf8'},
      {name: 'Ironman', link: '8See5hFhZrk5m3E8M'},
      {name: 'Leanput', link: 'R2Kf5cMQZkKQ7eupZ'},
      {name: 'Infinite Walking', link: 'ty8FMobbtxR6sEnKz'},
      {name: 'Temperature and Virtual Immersion', link: 'u72H322FYyp5uT4Ez'},
      {name: 'Epic', link: '6BdoZffPNbpWrToXA'},
      {name: 'Shatter Squad', link: '4CPNqDYbzuCsuDZiT'},
      {name: 'ISAACS', link: 'bqGqonWpF5LNSbSHC'},
      {name: 'Human Avatar', link: 'hbGYCjxKMLTE3cgSk'},
      {name: '', link: 'dXYn8TdRpx9go4d5p'},
      {name: 'ARrange', link: 'tTNWCMxQ55qe5acpx'},
      //{name: '', link: '4gHRkSXo4kEA87FGK'},
      //{name: '', link: 'QNyRENSd4PJncxLSb'},
      //{name: '', link: 'AvcopdT6TLdh4Jz5E'},
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
