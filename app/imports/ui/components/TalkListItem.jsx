import React, {Component} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {Link} from 'react-router-dom';
import {createTalk, renameTalk, deleteTalk} from '../../api/talks/methods.js';

class TalkListItem extends Component {
  renameTalk = () => {
    const {talk} = this.props;
    let validName = /[^a-zA-Z0-9 \.:\+()\-_%!&]/gi;
    let prompt = window.prompt('New talk name?', talk.name);
    if (prompt) {
      prompt = prompt.replace(validName, '-');
      prompt.trim();
    }

    if (!_.isEmpty(prompt)) {
      renameTalk.call({talkId: talk._id, newName: prompt});
    }
  };

  deleteTalk = () => {
    deleteTalk.call({talkId: this.props.talk._id});
  };

  render() {
    const {talk, files, images} = this.props;
    const talkLink = `/talks/${talk._id}`;

    return (
      <li className="list-group-item clearfix">
        <Link to={talkLink}>{talk.name}</Link>
        <div className="btn-m-group pull-right">
          <button onClick={this.renameTalk} className="btn-menu">
            rename
          </button>
          <button onClick={this.deleteTalk} className="btn-menu">
            delete
          </button>
        </div>
      </li>
    );
  }
}

TalkListItem.propTypes = {
  files: PropTypes.array,
  images: PropTypes.array,
};

TalkListItem.defaultProps = {
  files: [],
  images: [],
};

export default TalkListItem;
