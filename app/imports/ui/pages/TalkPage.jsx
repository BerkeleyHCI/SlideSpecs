import React from "react";
import { Meteor } from "meteor/meteor";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

import { Files } from "../../api/files/files.js";
import { Images } from "../../api/images/images.js";
import {
  createTalk,
  deleteTalk,
  setTalkProgress
} from "../../api/talks/methods.js";
import { deleteTalkFiles } from "../../api/files/methods.js";

import MenuContainer from "../containers/MenuContainer.jsx";
import BaseComponent from "../components/BaseComponent.jsx";
import AppNotification from "../components/AppNotification.jsx";
import AlertLink from "../components/AlertLink.jsx";
import { FullMessage } from "../components/Message.jsx";
import DragUpload from "../components/DragUpload.jsx";
import SelectUpload from "../components/SelectUpload.jsx";
import TalkListItem from "../components/TalkListItem.jsx";
import SlideFile from "../components/SlideFile.jsx";

export default class TalkPage extends BaseComponent {
  deleteFiles = () => {
    const { talk } = this.props;
    if (confirm("Really delete this talk?"))
      deleteTalkFiles.call({ talkId: talk._id });
  };

  updateMason = () => {
    if (this.props.images) {
      const grid = document.getElementById("grid");
      const mason = new Masonry(grid, { itemSelector: ".file-item" });
      this.setState({ mason });
    }
  };

  componentDidMount() {
    this.updateMason();
  }

  componentDidUpdate() {
    this.updateMason();
  }

  handleDropUpload = files => {
    this.handleUpload(files);
  };

  handleSelectUpload = e => {
    e.preventDefault();
    const files = [...e.currentTarget.files];
    this.handleUpload(files);
  };

  handleUpload = allfiles => {
    const files = [allfiles[0]]; // hack to only accept the first file.
    let { talk, fileLocator } = this.props;
    const handleToast = ({ msg, desc, icon, closeTime }) => {
      if (!closeTime) closeTime = 4000;
      toast(() => <AppNotification msg={msg} desc={desc} icon={icon} />, {
        autoClose: closeTime
      });
    };

    if (files) {
      files.map(file => {
        // Allow uploading files under 30MB for now.
        const goodSize = file.size <= 30985760;
        //const goodType = /(pdf|ppt|pptx|key)$/i.test(file.name);
        const goodType = /(pdf)$/i.test(file.name);
        if (!goodSize || !goodType) {
          handleToast({
            msg: "error",
            icon: "times",
            desc:
              //'Please only upload pdf/ppt/pptx, with size equal or less than 30MB.',
              "Please only upload pdf files, with size equal or less than 30MB."
          });
          return; // skip this file.
        }

        let uploadInstance = Files.insert(
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

        // TODO set the percent of the specific talk item for upload
        uploadInstance.on("progress", function(progress, file) {
          setTalkProgress.call({ talkId: talk._id, progress });
        });

        // TODO set the percent of the specific talk item for upload
        uploadInstance.on("uploaded", (err, file) => {
          console.log("uploaded", file.name);
          setTalkProgress.call({ talkId: talk._id, progress: 100 });
        });

        // TODO set status on talk item that uploading is done.
        uploadInstance.on("end", (err, file) => {
          console.log("file:", file);
          handleToast({
            msg: file.name,
            icon: "check",
            desc: "upload complete"
          });
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
      });
    }
  };

  deleteTalk = () => {
    const { talk } = this.props;
    localStorage.setItem("feedbacks.referringLink", "/");
    deleteTalk.call({ talkId: talk._id });
  };

  render() {
    const { uploading } = this.state;
    const { talk, name, file, images, comments } = this.props;
    const hasComments = comments.length > 0;

    let talkFile;
    try {
      let fileParams = { "meta.talkId": talk._id };
      talkFile = Files.findOne(fileParams).link("original", "//");
    } catch (e) {
      talkFile = "/404";
    }
    let imageSet = images.map((i, key) => (
      <SlideFile
        key={"file-" + key}
        iter={key + 1}
        fileUrl={Images.findOne(i._id).link("original", "//")}
        handleLoad={this.updateMason}
        fileId={i._id}
        fileName={i.name}
      />
    ));

    // TODO update this into the secret talk field instead of the regular // id
    const commentLink = window.location.origin + "/comment/" + talk._id;
    const uploadLink = window.location.origin + "/upload/" + talk._id;
    const reviewLink = window.location.origin + "/review/" + talk._id;

    const content = (
      <div className="main-content">
        <h1>
          <Link to={`/`}>
            <span className="black"> ‹ </span>
            {talk.name}
          </Link>
        </h1>

        {!file && (
          <div className="alert">
            add your presentation here.
            <SelectUpload
              labelText="+ new"
              className="pull-right btn-menu btn-primary"
              handleUpload={this.handleSelectUpload}
            />
            <hr />
            <DragUpload handleUpload={this.handleDropUpload} />
          </div>
        )}

        {uploading && (
          <div className="padded alert">
            <FullMessage title="uploading..." />
          </div>
        )}

        <AlertLink
          text={"share this talk with a public link"}
          bText={"open link"}
          link={commentLink}
        />

        {hasComments && (
          <AlertLink
            text={"review comments and feedback"}
            bText={"open link"}
            link={reviewLink}
          />
        )}

        {file && (
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
              <button
                onClick={this.deleteTalkFiles}
                className="btn btn-menu pull-right"
              >
                delete slides
              </button>
            </div>
          </div>
        )}

        {file && images.length == 0 && <TalkListItem talk={talk} />}

        <div id="grid" />
      </div>
    );

    return <MenuContainer {...this.props} content={content} />;
  }
}

// <div id="grid">{imageSet}</div>

TalkPage.propTypes = {
  user: PropTypes.object,
  images: PropTypes.array,
  comments: PropTypes.array
};

TalkPage.defaultProps = {
  user: null,
  comments: [],
  images: []
};
