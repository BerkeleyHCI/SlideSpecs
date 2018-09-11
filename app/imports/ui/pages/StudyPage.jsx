import {Meteor} from 'meteor/meteor';
import React, {Component} from 'react';

class StudyPage extends Component {
  render() {
    return (
      <div className="main-content">
        <h1>feedback</h1>
        <h2>instructions</h2>
        <div className="alert">please give feedback</div>
        <h2>presentations</h2>
        <div className="alert">links to all of the presentations</div>
      </div>
    );
  }
}

export default StudyPage;
