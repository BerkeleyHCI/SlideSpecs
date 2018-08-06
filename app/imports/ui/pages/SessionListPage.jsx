import React from 'react';
import PropTypes from 'prop-types';
import BaseComponent from '../components/BaseComponent.jsx';
import {Link} from 'react-router-dom';
import Message from '../components/Message.jsx';
import {
  createSession,
  updateSession,
  deleteSession,
} from '../../api/sessions/methods.js';

// Helper class for individual file items.

class SessionItem extends BaseComponent {
  updateSession = () => {
    console.log(this.props._id);
    //updateSession.call({ sessionId: this.props.id, newName: Date.now().toLocaleString(), })
  };

  deleteSession = () => {
    deleteSession.call({sessionId: this.props._id});
  };

  render() {
    const {_id, name} = this.props;
    const sessLink = `/sessions/${_id}`;
    return (
      <div>
        <Link to={sessLink}>{name}</Link>
        <button onClick={this.updateSession} className="btn btn-sm">
          rename
        </button>
        <button onClick={this.deleteSession} className="btn btn-sm">
          delete
        </button>
      </div>
      //onClick={() => }
    );
  }
}

SessionItem.propTypes = {id: PropTypes.string};

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
      Sessions = sessions.map(sess => <SessionItem key={sess._id} {...sess} />);
    }

    return (
      <div className="main-content">
        <h1>sessions</h1>
        <button onClick={this.addSession} className="btn btn-primary">
          + new
        </button>
        {Sessions}
      </div>
    );
  }
}

SessionListPage.propTypes = {sessions: PropTypes.array};
