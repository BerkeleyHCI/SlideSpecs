import React, {Component} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {Link} from 'react-router-dom';
import {createTalk, renameTalk, deleteTalk} from '../../api/talks/methods.js';
import Loading from '../components/Loading.jsx';
import {Images} from '../../api/images/images.js';
import Img from '../components/Image.jsx';

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
    const {talk, linkPre, images, session, sessionOwner} = this.props;
    const talkLink = `/${linkPre}/${talk._id}`;
    let iLink = '/loading.svg';
    // TODO - adding a timeout with session.created to show error after 3 min
    const hasImages = images && images.length > 0;
    const tImages = images.filter(i => i.meta.talkId === talk._id);
    if (hasImages) {
      try {
        const image = _.sortBy(tImages, x => Number(x.meta.slideNo))[0];
        const testImage = Images.findOne(image._id);
        if (testImage) iLink = testImage.link('original', '//');
      } catch (e) {
        console.error(e);
      }
    }

    // TODO - adding a grabber for ordering
    //<div className="col-sm-1">
    //<span>*</span>
    //</div>

    // TODO - add a notification if over three minutes have passed since the
    // talks.created field and then say that the file likely needs to be
    // reuploaded

    return (
      <li className="list-group-item clearfix">
        <div className="table no-margin">
          <div className="row equal">
            <div className="col-sm-3">
              {!linkPre && <Img className="preview" source={iLink} />}
              {linkPre && (
                <Link to={talkLink}>
                  <Img className="preview" source={iLink} />
                </Link>
              )}
            </div>
            <div className="col-sm-9 padded">
              {!linkPre && talk.name}
              {linkPre && <Link to={talkLink}>{talk.name}</Link>}
              {!hasImages && (
                <i>
                  <br /> generating slide images{' '}
                </i>
              )}
              {sessionOwner && (
                <div className="btn-m-group pull-right">
                  <button onClick={this.renameTalk} className="btn-menu">
                    rename
                  </button>
                  <button onClick={this.deleteTalk} className="btn-menu">
                    delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </li>
    );
  }
}

TalkListItem.propTypes = {
  images: PropTypes.array,
  linkPre: PropTypes.string,
  sessionOwner: PropTypes.bool,
};

TalkListItem.defaultProps = {
  images: [],
  linkPre: '',
  sessionOwner: false,
};

export default TalkListItem;
