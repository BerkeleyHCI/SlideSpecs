import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {deleteTalk} from '../../api/talks/methods.js';
import {Files} from '../../api/files/files.js';
import {Images} from '../../api/images/images.js';
import {toast} from 'react-toastify';
import AlertLink from '../components/AlertLink.jsx';
import BaseComponent from '../components/BaseComponent.jsx';
import SlideFile from '../components/SlideFile.jsx';
import TalkListItem from '../components/TalkListItem.jsx';
import CommentList from '../components/CommentList.jsx';
import _ from 'lodash';
import ReactDOMServer from 'react-dom/server';
import AppNotification from '../components/AppNotification.jsx';

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


  filterComment = c => {
    let newComment = _.pick(c, [
      'author',
      'content',
      'created',
      'agree',
      'discuss',
      'replies',
    ]);
    c.replies = c.replies || [];
    newComment.replies = c.replies.map(this.filterComment);
    return newComment;
  };

  downloadJSON = () => {
    const {comments, talk} = this.props;
    // Filtering out 'reply' comments.
    const reply = /\[.*\]\(\s?#c(.*?)\)/;
    const notReply = c => !reply.test(c.content);
    const isReply = c => reply.test(c.content);

    // Add label replies with which referring comment
    const replies = comments.filter(isReply).map(c => {
      const match = reply.exec(c.content);
      c.replyTo = match[1].trim();
      c.isReply = true;
      return c;
    });

    comments.map(c => {
      c.replies = replies.filter(r => r.replyTo == c._id);
    });

    const filtered = comments.filter(notReply).map(this.filterComment);

    const fname = `${talk.name}_comments.json`;
    const content = JSON.stringify(filtered, null, 2);
    this.createDownload({fname, content, type: 'application/json'});
  };

  createDownload = ({fname, content, type}) => {
    const file = new File([content], fname, {type: type});
    const element = document.createElement('a');
    element.href = URL.createObjectURL(file);
    element.download = fname;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast(() => (
      <AppNotification msg={'downloaded'} desc={fname} icon={'floppy-o'} />
    ));
  };

  // dev-html download start

  renderComments = () => {
    const {
      sorter,
      invert,
      filtered,
      activeComment,
      focusing,
      userOwn,
      byAuth,
      bySlide,
      byTag,
    } = this.state;
    const {talk, comments, reviewer, setModal, clearModal} = this.props;
    if (!comments || !comments.length) {
      return <div className="alert"> no comments yet</div>;
    } else {
      let csort = _.orderBy(
        comments,
        [sorter, 'created'],
        [invert ? 'desc' : 'asc', 'asc'],
      );

      // Filter out transcript comments.
      csort = csort.filter(c => c.author != 'transcript');

      // Focus view filtering - omit replies.
      if (userOwn) {
        csort = csort.filter(c => c.author === reviewer);
      }

      // Filtering 'reply' comments into array.
      // TODO - make it so this seperates on punctuation
      const reply = /\[.*\]\(\s?#c(.*?)\)/;
      const isReply = c => reply.test(c.content);
      const replies = csort.filter(isReply).map(c => {
        const match = reply.exec(c.content);
        c.replyTo = match[1].trim();
        c.isReply = true;
        return c;
      });

      // remove child comments.
      csort = csort.filter(c => !isReply(c));

      if (byAuth) {
        csort = csort.filter(c => c.author === byAuth);
      }

      if (bySlide) {
        csort = csort.filter(c => {
          const slides = c.slides.length > 0 ? c.slides : [];
          const slideNos = slides.map(x => x.slideNo);
          return slideNos.includes(bySlide);
        });
      }

      if (byTag) {
        csort = csort.filter(c => c.content.includes(byTag));
      }

      const items = csort.map((c, i) => {
        c.last = i === csort.length - 1; // no final hr
        c.active = c._id === activeComment; // highlight
        c.replies = replies.filter(r => r.replyTo == c._id);
        return {
          ...c,
          key: c._id,
          commentView: true,
          focused: true,
          allReplies: replies,
        };
      });

      const homeLink = window.location.origin + '/review/' + talk._id;
      return (
        <div>
          <AlertLink
            text={'Open the talk page on SlideSpecs with this link.'}
            link={homeLink}
          />
          <span className="comments-head" />
          <CommentList title={'comments'} items={items} />
          {items.length == 0 && <div className="alert"> no comments</div>}
        </div>
      );
    }
  };

  downloadHTML = () => {
    const renderComments = this.renderComments();
    const styleURL = document.querySelectorAll('link.__meteor-css__')[0].href;
    const commentStyle = this.httpGet(styleURL);
    const commentHtml = ReactDOMServer.renderToString(renderComments);
    const documentBody = `
    <head>
    <meta charset="utf-8"/>
    <style>${commentStyle}</style>
    </head>
    <body>
      <div class="padded">
        ${commentHtml}
      </div>
    </body>`;
    const {talk} = this.props;
    const fname = `${talk.name}_comments.html`;
    const content = documentBody;
    this.createDownload({fname, content, type: 'text/html'});
  };

  httpGet = theUrl => {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open('GET', theUrl, false); // false for synchronous request
    xmlHttp.send(null);
    return xmlHttp.responseText;
  };

  // dev-html download end



  render() {
    const {session, talk, name, images, comments, sessionOwner} = this.props;
    let talkFile;
    try {
      let fileParams = {'meta.talkId': talk._id};
      talkFile = Files.findOne(fileParams).link('original', '//');
    } catch (e) {
      talkFile = '/404';
    }
    let imageSet = images.map((i, key) => (
      <SlideFile
        key={'file-' + key}
        iter={key + 1}
        fileUrl={Images.findOne(i._id).link('original', '//')}
        handleLoad={this.updateMason}
        fileId={i._id}
        fileName={i.name}
      />
    ));

    const downloadLink = `/download/${talk._id}`;
    const commentLink = `/comment/${talk._id}`;
    const shareLink = `/share/${session._id}`;
    const sessLink = `/sessions/${session._id}`;
    const homeLink = sessionOwner ? sessLink : shareLink;

    return (
      this.renderRedirect() || (
        <div className="main-content">
          <h1>
            <Link to={homeLink}>
              <span className="black"> ‹ </span>
              {session.name}
            </Link>

            <small> / {name}</small>
          </h1>

          <AlertLink
            center={true}
            text={'view commenting interface'}
            link={commentLink}
          />

          <div className="clearfix alert">
            <ul>
              <li>slides: {images.length}</li>
              <li>comments: {comments.length}</li>
            </ul>
            <hr />

            <div className="btns-menu-space">
              <button onClick={this.downloadJSON} className="btn btn-menu btn-primary">
                  download json
              </button>
                <button onClick={this.downloadHTML} className="btn btn-menu btn-primary">
                  download html
                </button>
              <a download href={talkFile}>
                <button className="btn btn-menu btn-primary pull-right">
                  download slides pdf
                </button>
              </a>


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
