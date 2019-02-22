import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {deleteTalk} from '../../api/talks/methods.js';
import {Files} from '../../api/files/files.js';
import {Images} from '../../api/images/images.js';

import BaseComponent from '../components/BaseComponent.jsx';
import SlideFile from '../components/SlideFile.jsx';
import TalkListItem from '../components/TalkListItem.jsx';

class TalkPage extends BaseComponent {
  updateMason = () => {
    if (this.props.images) {
      const grid = document.getElementById('grid');
      const mason = new Masonry(grid, {itemSelector: '.file-item'});
      this.setState({mason});
    }
  };

  componentDidMount() {
    this.updateMason();
  }

  componentDidUpdate() {
    this.updateMason();
  }

  //<button
  //onClick={this.deleteTalk}
  //className="btn btn-menu pull-right">
  //delete presentation
  //</button>

  deleteTalk = () => {
    const {talkId, session} = this.props;
    this.redirectTo(session._id);
    deleteTalk.call({talkId});
  };

  render() {
    const {session, talk, name, images, comments} = this.props;
    let talkFile;
    try {
      let fileParams = {'meta.talkId': talk._id};
      talkFile = Files.findOne(fileParams).link();
    } catch (e) {
      talkFile = '/404';
    }
    let imageSet = images.map((i, key) => (
      <SlideFile
        key={'file-' + key}
        iter={key + 1}
        fileUrl={Images.findOne(i._id).link()}
        handleLoad={this.updateMason}
        fileId={i._id}
        fileName={i.name}
      />
    ));

    return (
      this.renderRedirect() || (
        <div className="main-content">
          <h1>
            <Link to={`/sessions/${session._id}`}>
              <span className="black"> ‹ </span>
              {session.name}
            </Link>

            <small> / {name}</small>
          </h1>

          <div className="alert">
            <ul>
              <li>slides: {images.length}</li>
              <li>comments: {comments.length}</li>
            </ul>
            <hr />

            <div className="btns-menu-space">
              <a download href={talkFile}>
                <button className="btn btn-menu btn-primary">
                  download original
                </button>
              </a>
              <Link to={`/comment/${talk._id}`}>
                <button className="btn btn-menu">view comments</button>
              </Link>
            </div>
          </div>

          {images.length == 0 && <TalkListItem talk={talk} />}

          <div id="grid">{imageSet}</div>
        </div>
      )
    );
  }
}

TalkPage.propTypes = {
  user: PropTypes.object,
  session: PropTypes.object,
  talkId: PropTypes.string,
  comments: PropTypes.array,
  images: PropTypes.array,
};

TalkPage.defaultProps = {
  user: null,
  session: {},
  comments: [],
  images: [],
};

export default TalkPage;
