import React from 'react';
import PropTypes from 'prop-types';

import BaseComponent from '../components/BaseComponent.jsx';
import Message from '../components/Message.jsx';
import {createSession} from '../../api/sessions/methods.js';

export default class SessionListPage extends BaseComponent {
  constructor(props) {
    super(props);
    this.addSession = this.addSession.bind(this);
  }

  addSession() {
    createSession.call({});
  }

  render() {
    const {sessions} = this.props;

    let Sessions;
    if (!sessions || !sessions.length) {
      Sessions = <Message title="no sessions" subtitle="add above" />;
    } else {
      Sessions = sessions.map(sess => <li> {sess.name} </li>);
    }

    return (
      <div className="main-content">
        <h1>sessions</h1>
        <button onClick={this.addSession} className="btn btn-primary">
          + new
        </button>
        <ul> {Sessions} </ul>
      </div>
    );
  }
}

SessionListPage.propTypes = {sessions: PropTypes.array};
