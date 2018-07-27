/* global alert */

import React from 'react';
import PropTypes from 'prop-types';
import {NavLink} from 'react-router-dom';
import BaseComponent from './BaseComponent.jsx';
import {insert} from '../../api/lists/methods.js';

export default class ListList extends BaseComponent {
  constructor(props) {
    super(props);
    this.createNewList = this.createNewList.bind(this);
  }

  createNewList() {
    const listId = insert.call({}, err => {
      if (err) {
        console.error(err);
        this.redirectTo('/');
      }
    });
    this.redirectTo(`/lists/${listId}`);
  }

  render() {
    const {lists} = this.props;
    return (
      this.renderRedirect() || (
        <div className="list-todos">
          <a className="link-list-new" onClick={this.createNewList}>
            <span className="icon-plus" />
            new deck
          </a>
          {lists.map(list => (
            <NavLink
              to={`/lists/${list._id}`}
              key={list._id}
              title={list.name}
              className="list-todo"
              activeClassName="active">
              {list.userId ? <span className="icon-lock" /> : null}
              {list.incompleteCount ? (
                <span className="count-list">{list.incompleteCount}</span>
              ) : null}
              {list.name}
            </NavLink>
          ))}
        </div>
      )
    );
  }
}

ListList.propTypes = {
  lists: PropTypes.array,
};
