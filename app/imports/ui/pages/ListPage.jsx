import React from 'react';
import PropTypes from 'prop-types';

import BaseComponent from '../components/BaseComponent.jsx';
import ListHeader from '../components/ListHeader.jsx';
import TodoItem from '../components/TodoItem.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import Message from '../components/Message.jsx';

export default class ListPage extends BaseComponent {
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
    const {list, listExists, loading, todos} = this.props;
    const {editingTodo} = this.state;

    if (!listExists) {
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
      <div className="page lists-show">
        <ListHeader list={list} />
        <div className="content-scrollable list-items">
          {loading ? <Message title="loading" /> : Todos}
        </div>
      </div>
    );
  }
}

ListPage.propTypes = {
  list: PropTypes.object,
  todos: PropTypes.array,
  loading: PropTypes.bool,
  listExists: PropTypes.bool,
};
