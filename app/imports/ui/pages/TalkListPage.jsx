import React from 'react';
import PropTypes from 'prop-types';
import BaseComponent from '../components/BaseComponent.jsx';
import MenuContainer from '../containers/MenuContainer.jsx';
import {Link} from 'react-router-dom';
import _ from 'lodash';
import {
  createTalk,
  renameTalk,
  deleteTalk,
} from '../../api/talks/methods.js';

// Helper class for individual file items.

class TalkItem extends BaseComponent {
  renameTalk = () => {
    const {_id, name} = this.props;
    let validName = /[^a-zA-Z0-9 .:+()\-_%!&]/gi;
    let prompt = window.prompt('New talk name?', name);

    if (prompt) {
      prompt = prompt.replace(validName, '-');
      prompt.trim();
    }

    if (!_.isEmpty(prompt)) {
      renameTalk.call({talkId: _id, newName: prompt});
    }
  };

  deleteTalk = () => {
    const {name} = this.props;
    if (confirm(`Delete ${name}?`))
      deleteTalk.call({talkId: this.props._id});
  };

  render() {
    const {_id, name} = this.props;
    const talkLink = `/talks/${_id}`;
    return (
      <li className="list-group-item clearfix">
        <Link to={talkLink}>{name}</Link>
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

// too dangerous for user study
// also TODO confirm w/ modal
//<button onClick={this.deleteTalk} className="btn-menu">G
//delete
//</button>

TalkItem.propTypes = {id: PropTypes.string};

export default class TalkListPage extends BaseComponent {
  addTalk = () => {
    createTalk.call({}, (err, res) => {
      if (err) {
        console.error(err);
      } else {
        this.redirectTo(`/talks/${res}`);
      }
    });
  };

  render() {
    let {talks} = this.props, talkList;
    if (!talks || !talks.length) {
      talkList = <div className="alert">no talks yet</div>;
    } else {
      talkList = talks.map(talk => <TalkItem key={talk._id} {...talk} />);
    }

    const content = (
      <div className="main-content">
        <h1>talks</h1>
        <Link to={'/guide'} className="btn btn-empty pull-right">
          user guide
        </Link>
        <button onClick={this.addTalk} className="btn btn-primary">
          + new talk
        </button>
        <ul className="v-pad list-group">{talkList}</ul>
      </div>
    );

    return (
      this.renderRedirect() || (
        <MenuContainer {...this.props} content={content} />
      )
    );
  }
}

TalkListPage.propTypes = {talks: PropTypes.array};
