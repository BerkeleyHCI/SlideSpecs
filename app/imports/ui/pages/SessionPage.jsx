import React from 'react';
import PropTypes from 'prop-types';

import BaseComponent from '../components/BaseComponent.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import Message from '../components/Message.jsx';

export default class SessionPage extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = Object.assign(this.state, {editingTodo: null});
    this.onEditingChange = this.onEditingChange.bind(this);
  }

  onEditingChange(id, editing) {
    this.setState({
      editingTodo: editing ? id : null,
    });
  }

  render() {
    const {session, sessionExists, loading, todos} = this.props;
    const {editingTodo} = this.state;

    if (!sessionExists) {
      return <NotFoundPage />;
    }

    let Todos;
    if (!todos || !todos.length) {
      Todos = <Message title="no tasks" subtitle="add above" />;
    } else {
      Todos = todos.map(todo => (
        <TodoItem
          todo={todo}
          key={todo._id}
          editing={todo._id === editingTodo}
          onEditingChange={this.onEditingChange}
        />
      ));
    }

    return (
      <div className="page sessions-show">
        <SessionHeader session={session} />
        <div className="content-scrollable session-items">
          {loading ? <Message title="loading" /> : Todos}
        </div>
      </div>
    );
  }
}

SessionPage.propTypes = {
  session: PropTypes.object,
  todos: PropTypes.array,
  loading: PropTypes.bool,
  sessionExists: PropTypes.bool,
};
