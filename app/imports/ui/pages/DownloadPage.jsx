
import React,  { useRef }  from 'react';
import _ from 'lodash';
import BaseComponent from '../components/BaseComponent.jsx';
import ClearingDiv from '../components/ClearingDiv.jsx';
import Comment from '../components/Comment.jsx';
import ReactToPrint from 'react-to-print';


// Control-log.
import {Logger} from 'meteor/ostrio:logger';
import {LoggerConsole} from 'meteor/ostrio:loggerconsole';
import { getDiffieHellman } from 'crypto';

class CommentPage extends BaseComponent {
  constructor(props) {
    super(props);

    // Control-log.
    this.logger = new Logger();
    new LoggerConsole(this.logger).enable();

    this.inRef = React.createRef();
    this.state = {
      defaultPriv: false,
      following: true,
      focusing: true,
      userOwn: false,
      redirectTo: null,
      activeComment: null,
      sorter: 'created',
      filter: 'time',
      invert: true,
      tags: [],
      bySlide: '',
      byAuth: '',
      byTag: '',
    };
  }

  log = data => {
    //console.log(data);
    const {reviewer, sessionId} = this.props;
    if (typeof data === 'string') {
      this.logger.info(
        JSON.stringify({data, reviewer, sessionId, time: Date.now()}),
      );
    } else if (Object.keys.length > 0) {
      this.logger.info(
        JSON.stringify({...data, reviewer, sessionId, time: Date.now()}),
      );
    } else {
      this.logger.info(
        JSON.stringify({data, reviewer, sessionId, time: Date.now()}),
      );
    }
  };


  setByAuth = e => {
    const {byAuth} = this.state;
    const newAuth = e.target.getAttribute('data-auth');
    if (newAuth && byAuth === newAuth) {
      this.setState({byAuth: ''});
    } else if (newAuth) {
      this.setState({byAuth: newAuth});
    }
  };

  clearByAuth = () => {
    this.setState({byAuth: ''});
  };

  setBySlide = e => {
    const {bySlide} = this.state;
    const newSlide = e.target.innerText.trim();
    if (newSlide && bySlide === newSlide) {
      this.setState({bySlide: ''});
    } else if (newSlide) {
      this.setState({bySlide: newSlide});
    }
  };

  clearBySlide = () => {
    this.setState({bySlide: ''});
  };

  // click on tag in comment
  setByTag = e => {
    e.preventDefault();
    const {byTag} = this.state;
    const newTag = e.target.innerText.trim();
    if (newTag && byTag === newTag) {
      this.setState({byTag: ''});
    } else if (newTag) {
      this.setState({byTag: newTag});
    }
  };

  // click on tag in filter
  insertTag = e => {
    e.preventDefault();
    const tag = e.target.innerText.trim();
    const textarea = this.inRef.current;
    if (textarea.value === '') {
      textarea.value = `${tag} `;
    } else if (!textarea.value.includes(tag)) {
      textarea.value += ` ${tag} `;
    }
    textarea.focus();
  };

  clearByTag = () => {
    this.setState({byTag: ''});
  };



  renderCommentFilter = () => {
    const filterer = this.renderFilter();

    const {invert, filter} = this.state;
    const invFn = () => this.setState({invert: !invert});
    const setSort = (s, f) => {
      return () => this.setState({sorter: s, filter: f});
    };

    const timeSort = setSort('created', 'time');
    const authSort = setSort(x => x.author.toLowerCase(), 'auth');
    const agreeSort = setSort(x => (x.agree || []).length, 'agree');
    const flagSort = setSort(x => (x.discuss || []).length, 'flag');
    const slideSort = setSort(
      x => (x.slides[0] ? Number(x.slides[0].slideNo) : Infinity),
      'slide',
    );

    return (
      <div className="float-at-top">
        <div className="btn-m-group btns-group">
          <button
            onClick={timeSort}
            className={'btn btn-menu' + (filter === 'time' ? ' active' : '')}>
            time
          </button>
          <button
            className={'btn btn-menu' + (filter === 'slide' ? ' active' : '')}
            onClick={slideSort}>
            slide
          </button>
          <button
            className={'btn btn-menu' + (filter === 'auth' ? ' active' : '')}
            onClick={authSort}>
            author
          </button>
          <button
            className={'btn btn-menu' + (filter === 'agree' ? ' active' : '')}
            onClick={agreeSort}>
            agree
          </button>
          <button
            className={'btn btn-menu' + (filter === 'flag' ? ' active' : '')}
            onClick={flagSort}>
            discuss
          </button>
          <button className={'btn btn-menu'} onClick={invFn}>
            {invert ? '▼' : '▲'}
          </button>
        </div>
        {filterer}
      </div>
    );
  };

  renderSubmit = () => {
    const {defaultPriv} = this.state;
    return (
      <div className="submitter">
        {defaultPriv && <i className="pull-right fa fa-lock textarea-icon" />}
        <TextArea
          inRef={this.inRef}
          handleSubmit={this.addComment}
          defaultValue="add feedback here."
          className="code comment-text"
        />
      </div>
    );
  };


  renderFilter = () => {
    const tagList = this.renderTags();
    let {byAuth, bySlide, byTag} = this.state;
    const sType = bySlide === 'general' ? 'scope' : 'slide';
    if (bySlide) bySlide = <kbd>{bySlide}</kbd>;

    return (
      <div className="filterer">
        <p> {tagList} </p>
        <ClearingDiv set={byTag} pre="tag" clear={this.clearByTag} />
        <ClearingDiv set={byAuth} pre="author" clear={this.clearByAuth} />
        <ClearingDiv set={bySlide} pre={sType} clear={this.clearBySlide} />
        <hr />
      </div>
    );
  };

  renderTags = () => {
    // COMMENTS DEFINED HERE
    const {comments} = this.props;
    const getTag = t => t.split(/\s/).filter(t => t[0] == '#' && t.length > 1);
    const alltags = comments.map(c => getTag(c.content));
    const unique = _.uniq(_.flatten(alltags));
    return unique.map(tag => (
      <a key={tag} onClick={this.insertTag} className="tag-link">
        {tag}
      </a>
    ));
  };

  goToTop = () => {
    const view = document.getElementsByClassName('comments-head');
    if (view[0]) {
      view[0].scrollIntoView({block: 'center', inline: 'center'});
    }
  };

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
    const {sessionId, comments, reviewer, setModal, clearModal} = this.props;
    if (!comments || !comments.length) {
      return <div className="alert"> no comments yet</div>;
    } else {
      let csort = _.orderBy(
        comments,
        [sorter, 'created'],
        [invert ? 'desc' : 'asc', 'asc'],
      );

      // Focus view filtering - omit replies.
      if (userOwn) {
        csort = csort.filter(c => c.author === reviewer);
      }

      // Filtering 'reply' comments into array. HATE.
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
          const general = [{slideNo: 'general'}];
          const slides = c.slides.length > 0 ? c.slides : general;
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
          reviewer,
          setModal,
          sessionId,
          clearModal,
          activeComment,
          log: this.log,
          focused: true,
          bySlide: bySlide,
          allReplies: replies,
          commentRef: this.inRef,
          handleTag: this.setByTag,
          handleAuthor: this.setByAuth,
          handleSlideIn: this.handleSlideIn,
          handleSlideOut: this.handleSlideOut,
          clearButton: this.clearButton,
          clearBySlide: this.clearBySlide,
          setBySlide: this.setBySlide,
          setActive: this.setActiveComment,
          unsetActive: this.clearActiveComment,
        };
      });

      return (
        <div>
          <div id="comments-list" className="alert">
            {items.map((i, iter) => (
              <Comment key={`comment-${iter}`} {...i} />
            ))}
          </div>
          {items.length >= 5 && (
            <div className="padded full-width">
              <button
                onClick={this.goToTop}
                className="btn center btn-menu btn-round">
                <i className={'fa fa-arrow-up no-padding'} />
              </button>
              <div className="v-pad" />
            </div>
          )}
          {items.length == 0 && <div className="alert"> no comments</div>}
        </div>
      );
    }
  };

  // renderCommentContents = () => {
  //   const comments = this.renderComments();
  //   const commentsList = comments.props.children[0].props.children;
  //   var commentsContent = [];
  //   var i;
  //   // Loops through all the comments and appends to array
  //   for (i = 0; i < commentsList.length; i++) {
  //     commentsContent.push(comments.props.children[0].props.children[i].props.content);
  //   }
  //   // Reverses order so that the most recent comments are at the bottom
  //   commentsContent.reverse();
  //   console.log(commentsContent);

  //   var wrapper = document.createElement('div'),
  //   myClass = document.getElementsByClassName('myClass');
  //   myClass[0].parentElement.appendChild(wrapper);
  //   wrapper.id = 'wrapper';
  //   for (var len = myClass.length - 1; len >=0; --len) {
  //     wrapper.insertBefore(myClass[len], wrapper.firstChild);
  // }
  

  //   return (
  //     <div>
  //         <div id="comments-list" className="alert">
  //           {items.map((i, iter) => (
  //             <Comment key={`comment-${iter}`} {...i} />
  //           ))}
  //         </div>
  //         {items.length >= 5 && (
  //           <div className="padded full-width">
  //             <button
  //               onClick={this.goToTop}
  //               className="btn center btn-menu btn-round">
  //               <i className={'fa fa-arrow-up no-padding'} />
  //             </button>
  //             <div className="v-pad" />
  //           </div>
  //         )}
  //         {items.length == 0 && <div className="alert"> no comments</div>}
  //     </div>
  //   );

  // };
 
  _downloadTxtFile = () => {
    const {comments, name} = this.props;
    const filtered = comments.map(({author, content, created, agree, discuss, replies}) => {
      return {author, content, created, agree, discuss, replies}
    })

    const content = JSON.stringify(filtered, null, 2)
    var file = new Blob(content, {type: 'application/json'});
    var element = document.createElement("a");
    element.href = URL.createObjectURL(file);
    element.download = `${name}_comments.json`;
    element.click();
  }

  

  render() {
    const {files, userId} = this.props;
    const cmtHead = this.renderCommentFilter();
    const comments = this.renderComments();

    return files ? (
      this.renderRedirect() || (
        <div className="reviewView">
          <div
            id="review-view"
            className="table review-table">
            <div className="row">
              <div className="col-sm-12">
                {cmtHead}
                {comments}  
                  <div className="alert">
                     <div className="btns-menu-space">
              
                         <button className="btn btn-menu btn-primary" onClick={this._downloadTxtFile}>
                           Download Comments
                         </button>
                     
                     </div>
                   </div>
                
              </div>
            </div>
          </div>
        </div>
      )
    ) : (
      <div>loading file list...</div>
    );


  }


}

export default CommentPage;