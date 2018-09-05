import {Meteor} from 'meteor/meteor';
import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import ConvertInstructions from '../components/ConvertInstructions.jsx';

class ConvertPage extends Component {
  render() {
    return (
      <div className="main-content">
        <h1>
          <Link to="/">feedback</Link>
        </h1>

        <h2>slide conversion help</h2>

        <div className="alert">
          <ConvertInstructions />
          <hr />
          then, select and upload all the images at once.
        </div>
      </div>
    );
  }
}

export default ConvertPage;
