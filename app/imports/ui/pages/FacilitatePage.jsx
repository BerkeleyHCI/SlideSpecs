import { Meteor } from "meteor/meteor";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { Session } from "meteor/session.js";
import { withTracker } from "meteor/react-meteor-data";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import _ from "lodash";

import { Sounds } from "../../api/sounds/sounds.js";
import { Images } from "../../api/images/images.js";
import BaseComponent from "../components/BaseComponent.jsx";
import AlertLink from "../components/AlertLink.jsx";
import AppNotification from "../components/AppNotification.jsx";
import SpeechRecognition from "react-speech-recognition";
import Input from "../components/Input.jsx";
import TextArea from "../components/TextArea.jsx";
import SlideTags from "../components/SlideTags.jsx";
import ClearingDiv from "../components/ClearingDiv.jsx";
import FileReview from "../components/FileReview.jsx";
import Clock from "../components/Clock.jsx";
import Img from "../components/Image.jsx";
import Message from "../components/Message.jsx";
import Comment from "../components/Comment.jsx";
import { Comments } from "../../api/comments/comments.js";
import { createComment, addressComment } from "../../api/comments/methods.js";
import { setRespondingComment } from "../../api/talks/methods.js";

// Control-log.
import { Logger } from "meteor/ostrio:logger";
import { LoggerConsole } from "meteor/ostrio:loggerconsole";

class FacilitatePage extends BaseComponent {
  constructor(props) {
    super(props);

    // Control-log.
    this.logger = new Logger();
    new LoggerConsole(this.logger).enable();

    this.inRef = React.createRef();
    this.state = {
      recording: false,
      redirectTo: null,
      sorter: "flag",
      filter: "flag",
      invert: true,
      bySlide: "",
      byAuth: "",
      byTag: ""
    };
  }

  log = data => {
    //console.log(data);
    const { reviewer, talk } = this.props;
    if (typeof data === "string") {
      this.logger.info(
        JSON.stringify({ data, reviewer, talk, time: Date.now() })
      );
    } else if (Object.keys.length > 0) {
      this.logger.info(
        JSON.stringify({ ...data, reviewer, talk, time: Date.now() })
      );
    } else {
      this.logger.info(
        JSON.stringify({ data, reviewer, talk, time: Date.now() })
      );
    }
  };

  componentDidMount = () => {
    if (!navigator.getUserMedia)
      navigator.getUserMedia =
        navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    if (!navigator.cancelAnimationFrame)
      navigator.cancelAnimationFrame =
        navigator.webkitCancelAnimationFrame ||
        navigator.mozCancelAnimationFrame;
    if (!navigator.requestAnimationFrame)
      navigator.requestAnimationFrame =
        navigator.webkitRequestAnimationFrame ||
        navigator.mozRequestAnimationFrame;

    navigator.getUserMedia(
      {
        audio: {
          mandatory: {
            googEchoCancellation: "false",
            googAutoGainControl: "false",
            googNoiseSuppression: "false",
            googHighpassFilter: "false"
          },
          optional: []
        }
      },
      gotStream,
      function(e) {
        alert("Error getting audio");
        console.log(e);
      }
    );
  };

  setByAuth = e => {
    const { byAuth } = this.state;
    const newAuth = e.target.getAttribute("data-auth");
    if (newAuth && byAuth === newAuth) {
      this.setState({ byAuth: "" });
    } else if (newAuth) {
      this.setState({ byAuth: newAuth });
    }
  };

  clearByAuth = () => {
    this.setState({ byAuth: "" });
  };

  setBySlide = e => {
    const { bySlide } = this.state;
    const newSlide = e.target.innerText.trim();
    if (newSlide && bySlide === newSlide) {
      this.setState({ bySlide: "" });
    } else if (newSlide) {
      this.setState({ bySlide: newSlide });
    }
  };

  clearBySlide = () => {
    this.setState({ bySlide: "" });
  };

  // click on tag in comment
  setByTag = e => {
    e.preventDefault();
    const { byTag } = this.state;
    const newTag = e.target.innerText.trim();
    if (newTag && byTag === newTag) {
      this.setState({ byTag: "" });
    } else if (newTag) {
      this.setState({ byTag: newTag });
    }
  };

  clearByTag = () => {
    this.setState({ byTag: "" });
  };

  updateImage = fid => {
    const link = Images.findOne({ _id: fid }).link("original", "//");
    this.setState({ image: link });
  };

  updateHoverImage = link => {
    this.setState({ hoverImage: link, image: link });
  };

  handleSlideIn = e => {
    const src = e.target.querySelector("img").src;
    if (src) this.updateHoverImage(src);
  };

  handleSlideOut = e => {
    this.setState({ hoverImage: false });
  };

  renderCommentFilter = () => {
    const filterer = this.renderFilter();

    const { images } = this.props;
    const { control, invert, filter } = this.state;
    const invFn = () => this.setState({ invert: !invert });
    const setSort = (s, f) => {
      return () => this.setState({ sorter: s, filter: f });
    };

    const timeSort = setSort("created", "time");
    const authSort = setSort(x => x.author.toLowerCase(), "auth");
    const agreeSort = setSort(x => (x.agree || []).length, "agree");
    const flagSort = setSort(x => (x.discuss || []).length, "flag");
    const slideSort = setSort(
      x => (x.slides[0] ? Number(x.slides[0].slideNo) : Infinity),
      "slide"
    );

    return (
      <div className="float-at-top">
        <div className="btn-m-group btns-group">
          <button
            onClick={timeSort}
            className={"btn btn-menu" + (filter === "time" ? " active" : "")}
          >
            time
          </button>
          <button
            className={"btn btn-menu" + (filter === "slide" ? " active" : "")}
            onClick={slideSort}
          >
            slide
          </button>
          <button
            className={"btn btn-menu" + (filter === "auth" ? " active" : "")}
            onClick={authSort}
          >
            auth
          </button>
          <button
            className={"btn btn-menu" + (filter === "agree" ? " active" : "")}
            onClick={agreeSort}
          >
            agree
          </button>
          <button
            className={"btn btn-menu" + (filter === "flag" ? " active" : "")}
            onClick={flagSort}
          >
            discuss
          </button>
          <button className={"btn btn-menu"} onClick={invFn}>
            {invert ? "▼" : "▲"}
          </button>
        </div>
        {filterer}
      </div>
    );
  };

  renderFiles = () => {
    const { images } = this.props;
    return images.map((f, key) => {
      let link = Images.findOne({ _id: f._id }).link("original", "//");
      return (
        <FileReview
          key={"file-" + key}
          iter={key + 1}
          fileUrl={link}
          fileId={f._id}
          fileName={f.name}
          active={false}
          handleMouse={this.handleSlideIn}
          handleMouseOut={this.handleSlideOut}
        />
      );
    });
  };

  renderFilter = () => {
    let { control, byAuth, bySlide, byTag } = this.state;
    const sType = bySlide === "general" ? "scope" : "slide";
    const { browserSupportsSpeechRecognition } = this.props;
    if (bySlide) bySlide = <kbd>{bySlide}</kbd>;

    return (
      <div className="filterer alert clearfix">
        <ClearingDiv set={byTag} pre="tag" clear={this.clearByTag} />
        <ClearingDiv set={byAuth} pre="author" clear={this.clearByAuth} />
        <ClearingDiv set={bySlide} pre={sType} clear={this.clearBySlide} />
      </div>
    );
  };

  renderCommentData = (arr, replies, c, i) => {
    const { sessionId, comments, reviewer, setModal, clearModal } = this.props;
    const { sorter, invert, byAuth, bySlide, byTag, control } = this.state;
    c.last = i === arr.length - 1; // no final hr
    c.replies = replies.filter(r => r.replyTo == c._id);
    return {
      ...c,
      key: c._id,
      reviewer,
      setModal,
      clearModal,
      sessionId,
      log: this.log,
      discussView: true,
      allReplies: replies,
      commentRef: this.inRef,
      handleTag: this.setByTag,
      handleAuthor: this.setByAuth,
      startRecord: this.resumeTranscript,
      bySlide: bySlide,
      handleSlideIn: this.handleTagIn,
      handleSlideOut: this.handleSlideOut,
      clearButton: this.clearButton,
      clearBySlide: this.clearBySlide,
      setBySlide: this.setBySlide
    };
  };

  renderComments = () => {
    const { sorter, invert, byAuth, bySlide, byTag, control } = this.state;
    const { talk, comments, reviewer, setModal, clearModal } = this.props;
    if (!comments || !comments.length) {
      return <div className="alert"> no comments yet</div>;
    } else {
      let csort = _.orderBy(
        comments,
        [sorter, "created"],
        [invert ? "desc" : "asc", "asc"]
      );

      // Clean - filter out active responding comment.
      csort = csort.filter(c => c._id !== talk.active);

      // Filtering 'reply' comments into array.
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

      // split off 'addressed' comments
      const addressed = csort.filter(c => c.addressed);
      csort = csort.filter(c => !c.addressed);

      // Clean - filter out those without discuss.
      const unmarked = csort.filter(c => c.discuss.length == 0);
      csort = csort.filter(c => c.discuss.length > 0);

      if (byAuth) {
        csort = csort.filter(c => c.author === byAuth);
      }

      if (bySlide) {
        csort = csort.filter(c => {
          const general = [{ slideNo: "general" }];
          const slides = c.slides.length > 0 ? c.slides : general;
          const slideNos = slides.map(x => x.slideNo);
          return slideNos.includes(bySlide);
        });
      }

      if (byTag) {
        csort = csort.filter(c => c.content.includes(byTag));
      }

      const items = csort.map((c, i) =>
        this.renderCommentData(csort, replies, c, i)
      );

      const addressedItems = addressed.map((c, i) =>
        this.renderCommentData(addressed, replies, c, i)
      );

      const unmarkedItems = unmarked.map((c, i) =>
        this.renderCommentData(unmarked, replies, c, i)
      );

      return (
        <div>
          {items.length > 0 && (
            <div>
              <h2>to discuss</h2>
              <div id="comments-list" className="alert">
                {items.map(i => (
                  <Comment feedback={true} {...i} />
                ))}
              </div>
            </div>
          )}

          {addressedItems.length > 0 && (
            <div>
              <h2>discussed</h2>
              <div id="comments-list" className="alert">
                {addressedItems.map(i => (
                  <Comment feedback={true} {...i} />
                ))}
              </div>
            </div>
          )}

          {unmarkedItems.length > 0 && (
            <div>
              <h2>unmarked</h2>
              <div id="comments-list" className="alert">
                {addressedItems.map(i => (
                  <Comment {...i} />
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }
  };

  handleUpload = blob => {
    let { talk, fileLocator } = this.props;
    const handleToast = ({ msg, desc, icon, closeTime }) => {
      if (!closeTime) closeTime = 4000;
      toast(() => <AppNotification msg={msg} desc={desc} icon={icon} />, {
        autoClose: closeTime
      });
    };

    let file = this.blobToFile(blob);
    console.log(blob, file);

    // Allow uploading files under 50MB for now.
    const goodSize = file.size <= 50985760;
    const goodType = /(wav)$/i.test(file.name);
    if (!goodSize || !goodType) {
      handleToast({
        msg: "error",
        icon: "times",
        desc: "Error saving media."
      });
      return; // skip this file.
    }

    let uploadInstance = Sounds.insert(
      {
        file,
        meta: {
          locator: fileLocator,
          userId: Meteor.userId(),
          talkId: talk._id
        },
        //transport: 'http',
        streams: "dynamic",
        chunkSize: "dynamic",
        allowWebWorkers: true
      },
      false // dont autostart the uploadg
    );

    uploadInstance.on("start", (err, file) => {
      //console.log('started', file.name);
    });

    // TODO set status on talk item that uploading is done.
    uploadInstance.on("end", (err, file) => {
      console.log("file:", file);
      if (!err) {
        handleToast({
          msg: file.name,
          icon: "check",
          desc: "upload complete"
        });
      }
    });

    uploadInstance.on("error", (err, file) => {
      if (err) console.error(err, file);
      handleToast({
        msg: file.name,
        icon: "times",
        desc: `Error uploading: ${err}`
      });
    });

    uploadInstance.start();
  };

  renderContext = () => {
    const fileList = this.renderFiles();
    const { talk } = this.props;
    const { image, hoverImage, bySlide } = this.state;
    const imgSrc = hoverImage ? hoverImage : image;

    return (
      <div className="context-filter float-at-top">
        <Img className="big-slide" source={imgSrc} />
        <div id="grid-holder">
          <div id="grid">{fileList}</div>
        </div>
      </div>
    );
  };

  clearRespond = () => {
    const { talk } = this.props;
    setRespondingComment.call({ talk: talk._id, commentId: "" });
  };

  renderRespond = () => {
    const { talk } = this.props;
    if (!talk.active) return;
    const respond = Comments.findOne(talk.active);
    if (!respond) return;
    return (
      <div>
        <h2> discussing </h2>
        <div id="comments-list" className="alert">
          <Comment {...respond} feedback={true} last={true} />
        </div>
      </div>
    );
  };

  renderSounds = () => {
    const { recording } = this.state;
    const classRecord = recording ? "recording" : "waiting";
    return (
      <div>
        <h2> audio </h2>
        <div id="viz">
          <canvas id="analyser" width="1024" height="500" />
          <canvas id="wavedisplay" width="1024" height="500" />
        </div>
        <div id="controls">
          <img
            id="record"
            className={classRecord}
            src="/img/mic128.png"
            onClick={this.toggleRecording}
          />
          <img id="save" src="/img/save.svg" onClick={this.toggleUpload} />
        </div>
      </div>
    );
  };

  toggleRecording = () => {
    const { recording } = this.state;
    window.toggleRecording(recording);
    this.setState({ recording: !recording });
  };

  blobToFile = blob => {
    const { talk } = this.props;
    const lastModified = Date.now();
    const name = blob.name = `${talk.name}.wav`;
    return new File([blob], name, {lastModified});
  };

  toggleUpload = () => {
    window.audioRecorder.exportWAV(this.handleUpload);
  };

  render() {
    const { images } = this.props;
    const context = this.renderSounds();
    const respond = this.renderRespond();
    const comments = this.renderComments();

    /*
    const context = this.renderContext();
    const cmtHead = this.renderCommentFilter();
                {cmtHead}
}
*/

    return images ? (
      this.renderRedirect() || (
        <div className="main-content">
          <div className="reviewView">
            <div id="review-view" className="table review-table">
              <div className="row">
                <div className="col-sm-5 no-float">{context}</div>
                <div className="col-sm-7">
                  {respond}
                  {comments}
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    ) : (
      <div>waiting for slides</div>
    );
  }
}

export default FacilitatePage;