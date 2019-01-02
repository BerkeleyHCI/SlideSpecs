import {Meteor} from 'meteor/meteor';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {_} from 'lodash';
import {toast} from 'react-toastify';

import {Images} from '../../api/images/images.js';
import {deleteTalk} from '../../api/talks/methods.js';
import SlideFile from '../components/SlideFile.jsx';
import {Message} from '../components/Message.jsx';

class TalkPage extends Component {
  updateMason = () => {
    if (this.props.images) {
      const grid = document.getElementById('grid');
      const mason = new Masonry(grid, {itemSelector: '.file-item'});
    }
  };

  componentDidMount() {
    this.updateMason();
  }

  componentDidUpdate() {
    this.updateMason();
  }

  deleteTalk = () => {
    const {talkId} = this.props;
    deleteTalk.call({talkId});
  };

  render() {
    const {session, talk, name, files, images, comments, events} = this.props;
    let imageSet = images.map((i, key) => (
      <SlideFile
        key={'file-' + key}
        iter={key + 1}
        fileUrl={Images.findOne({_id: i._id}).link('original', '//')}
        handleLoad={this.updateMason}
        fileId={i._id}
        fileName={i.name}
      />
    ));

    return (
      <div className="main-content">
        <h1>
          <Link to={`/sessions/${session._id}`}>
            <span className="black"> ‹ </span>
            {session.name}
            <small>{name}</small>
          </Link>
        </h1>

        <div className="alert">
          <ul>
            <li>slides: {images.length}</li>
            <li>comments: {comments.length}</li>
            <li>actions: {events.length}</li>
          </ul>
          <hr />
          <button className="btn btn-menu btn-primary">
            download original
          </button>
          <button onClick={this.deleteTalk} className="btn btn-menu pull-right">
            delete presentation
          </button>
        </div>

        {images.length > 0 && <div id="grid">{imageSet}</div>}
      </div>
    );
  }
}

TalkPage.propTypes = {
  user: PropTypes.object,
  talkId: PropTypes.string,
  images: PropTypes.array,
  comments: PropTypes.array,
  events: PropTypes.array,
};

TalkPage.defaultProps = {
  user: null,
  images: [],
  comments: [],
  events: [],
};

export default TalkPage;
