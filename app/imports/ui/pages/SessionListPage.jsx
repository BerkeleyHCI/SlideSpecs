import React from 'react';
import PropTypes from 'prop-types';

import BaseComponent from '../components/BaseComponent.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import Message from '../components/Message.jsx';

export default class SessionPage extends BaseComponent {
  render() {
    const {session, sessionExists, loading, sessions} = this.props;
    const {editingSession} = this.state;

    if (!sessionExists) {
      return <NotFoundPage />;
    }

    let Sessions;
    if (!sessions || !sessions.length) {
      Sessions = <Message title="no sessions" subtitle="add above" />;
    } else {
      Sessions = sessions.map(sess => (
        <SessionItem
          todo={todo}
          key={todo._id}
          editing={todo._id === editingSession}
          onEditingChange={this.onEditingChange}
        />
      ));
    }

    return (
      <div className="main-content">
        <h1>sessions</h1>
        {loading ? <Message title="loading" /> : Sessions}
      </div>
    );
  }
}

SessionPage.propTypes = {
  session: PropTypes.object,
  loading: PropTypes.bool,
  sessionExists: PropTypes.bool,
};
