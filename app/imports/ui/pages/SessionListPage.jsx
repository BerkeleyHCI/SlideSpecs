import React from 'react';
import PropTypes from 'prop-types';
import BaseComponent from '../components/BaseComponent.jsx';
import MenuContainer from '../containers/MenuContainer.jsx';
import {Link} from 'react-router-dom';
import _ from 'lodash';
import {
  createSession,
  renameSession,
  deleteSession,
} from '../../api/talks/methods.js';

// Helper class for individual file items.

class SessionItem extends BaseComponent {
  renameSession = () => {
    const {_id, name} = this.props;
    let validName = /[^a-zA-Z0-9 .:+()\-_%!&]/gi;
    let prompt = window.prompt('New session name?', name);

    if (prompt) {
      prompt = prompt.replace(validName, '-');
      prompt.trim();
    }

    if (!_.isEmpty(prompt)) {
      renameSession.call({sessionId: _id, newName: prompt});
    }
  };

  deleteSession = () => {
    const {name} = this.props;
    if (confirm(`Delete ${name}?`))
      deleteSession.call({sessionId: this.props._id});
  };

  render() {
    const {_id, name} = this.props;
    const sessLink = `/sessions/${_id}`;
    return (
      <li className="list-group-item clearfix">
        <Link to={sessLink}>{name}</Link>
        <div className="btn-m-group pull-right">
          <button onClick={this.renameSession} className="btn-menu">
            rename
          </button>
          <button onClick={this.deleteSession} className="btn-menu">
            delete
          </button>
        </div>
      </li>
    );
  }
}

// too dangerous for user study
// also TODO confirm w/ modal
//<button onClick={this.deleteSession} className="btn-menu">
//delete
//</button>

SessionItem.propTypes = {id: PropTypes.string};

export default class SessionListPage extends BaseComponent {
  addSession = () => {
    createSession.call({}, (err, res) => {
      if (err) {
        console.error(err);
      } else {
        this.redirectTo(`/sessions/${res}`);
      }
    });
  };

  render() {
    const {sessions} = this.props;

    let Sessions;
    if (!sessions || !sessions.length) {
      Sessions = <div className="alert">no sessions yet</div>;
    } else {
      Sessions = sessions.map(sess => <SessionItem key={sess._id} {...sess} />);
    }

    const content = (
      <div className="main-content">
        <h1>sessions</h1>
        <Link to={'/guide'} className="btn btn-empty pull-right">
          user guide
        </Link>
        <button onClick={this.addSession} className="btn btn-primary">
          + new session
        </button>
        <ul className="v-pad list-group">{Sessions}</ul>
      </div>
    );

    return (
      this.renderRedirect() || (
        <MenuContainer {...this.props} content={content} />
      )
    );
  }
}

SessionListPage.propTypes = {sessions: PropTypes.array};
