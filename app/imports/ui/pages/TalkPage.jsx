/* global Masonry */

import React from "react";
import _ from "lodash";
import { Meteor } from "meteor/meteor";
import PropTypes from "prop-types";
import { toast } from "react-toastify";

import CommentList from "../components/CommentList.jsx";
import { Files } from "../../api/files/files.js";
import { Images } from "../../api/images/images.js";
import { setTalkProgress } from "../../api/talks/methods.js";
import MenuContainer from "../containers/MenuContainer.jsx";
import BaseComponent from "../components/BaseComponent.jsx";
import AppNotification from "../components/AppNotification.jsx";
import AlertLink from "../components/AlertLink.jsx";
import LocalLink from "../components/LocalLink.jsx";
import { FullMessage } from "../components/Message.jsx";
import DragUpload from "../components/DragUpload.jsx";
import SelectUpload from "../components/SelectUpload.jsx";
import TalkListItem from "../components/TalkListItem.jsx";
import SlideFile from "../components/SlideFile.jsx";
import ReactDOMServer from "react-dom/server";

export default class TalkPage extends BaseComponent {
    componentDidMount = () => {
        this.handleLoad();
    };

    componentDidUpdate = () => {
        this.handleLoad();
    };

    handleLoad = () => {
        const grid = document.getElementById("grid");
        const itemSel = { itemSelector: ".file-item" };
        new Masonry(grid, itemSel);
    };

    handleDropUpload = (files) => {
        this.handleUpload(files);
    };

    handleSelectUpload = (e) => {
        e.preventDefault();
        const files = [...e.currentTarget.files];
        this.handleUpload(files);
    };

    handleUpload = (allfiles) => {
        const files = [allfiles[0]]; // hack to only accept the first file.
        let { talk, fileLocator } = this.props;
        const handleToast = ({ msg, desc, icon, closeTime }) => {
            if (!closeTime) closeTime = 4000;
            toast(() => <AppNotification msg={msg} desc={desc} icon={icon} />, {
                autoClose: closeTime,
            });
        };

        if (files) {
            files.map((file) => {
                // Allow uploading files under 30MB for now.
                const goodSize = file.size <= 30985760;
                const goodType = /(pdf)$/i.test(file.name);
                if (!goodSize || !goodType) {
                    handleToast({
                        msg: "error",
                        icon: "times",
                        desc:
                            //'Please only upload pdf/ppt/pptx, with size equal or less than 30MB.',
                            "Please only upload pdf files, with size equal or less than 30MB.",
                    });
                    return; // skip this file.
                }

                let uploadInstance = Files.insert(
                    {
                        file,
                        meta: {
                            locator: fileLocator,
                            userId: Meteor.userId(),
                            talkId: talk._id,
                        },
                        //transport: 'http',
                        streams: "dynamic",
                        chunkSize: "dynamic",
                        allowWebWorkers: true,
                    },
                    false // dont autostart the uploadg
                );

                uploadInstance.on("start", (err, file) => {
                    //console.log('started', file.name);
                    this.setState({ uploading: true });
                    handleToast({
                        msg: file.name,
                        icon: "spinner",
                        desc: `Uploading...`,
                    });
                });

                uploadInstance.on("progress", function (progress) {
                    setTalkProgress.call({ talkId: talk._id, progress });
                });

                uploadInstance.on("uploaded", (err, file) => {
                    console.log("uploaded", file.name);
                    setTalkProgress.call({ talkId: talk._id, progress: 100 });
                });

                uploadInstance.on("end", (err, file) => {
                    this.setState({ uploading: false });
                    console.log("file:", file);
                    handleToast({
                        msg: file.name,
                        icon: "check",
                        desc: "upload complete",
                    });
                });

                uploadInstance.on("error", (err, file) => {
                    if (err) console.error(err, file);
                    handleToast({
                        msg: file.name,
                        icon: "times",
                        desc: `Error uploading: ${err}`,
                    });
                });

                uploadInstance.start();
            });
        }
    };

    filterComment = (c) => {
        let newComment = _.pick(c, [
            "author",
            "content",
            "created",
            "agree",
            "discuss",
            "replies",
        ]);
        c.replies = c.replies || [];
        newComment.replies = c.replies.map(this.filterComment);
        return newComment;
    };

    downloadJSON = () => {
        const { comments, talk } = this.props;
        // Filtering out 'reply' comments.
        const reply = /\[.*\]\(\s?#c(.*?)\)/;
        const notReply = (c) => !reply.test(c.content);
        const isReply = (c) => reply.test(c.content);

        // Add label replies with which referring comment
        const replies = comments.filter(isReply).map((c) => {
            const match = reply.exec(c.content);
            c.replyTo = match[1].trim();
            c.isReply = true;
            return c;
        });

        comments.map((c) => {
            c.replies = replies.filter((r) => r.replyTo == c._id);
        });

        const filtered = comments.filter(notReply).map(this.filterComment);

        const fname = `${talk.name}_comments.json`;
        const content = JSON.stringify(filtered, null, 2);
        this.createDownload({ fname, content, type: "application/json" });
    };

    createDownload = ({ fname, content, type }) => {
        const file = new File([content], fname, { type: type });
        const element = document.createElement("a");
        element.href = URL.createObjectURL(file);
        element.download = fname;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        toast(() => (
            <AppNotification
                msg={"downloaded"}
                desc={fname}
                icon={"floppy-o"}
            />
        ));
    };

    // dev-html download start

    renderComments = () => {
        const {
            sorter,
            invert,
            activeComment,
            userOwn,
            byAuth,
            bySlide,
            byTag,
        } = this.state;
        const { talk, comments, reviewer } = this.props;
        if (!comments || !comments.length) {
            return <div className="alert"> no comments yet</div>;
        } else {
            let csort = _.orderBy(
                comments,
                [sorter, "created"],
                [invert ? "desc" : "asc", "asc"]
            );

            // Filter out transcript comments.
            csort = csort.filter((c) => c.author != "transcript");

            // Focus view filtering - omit replies.
            if (userOwn) {
                csort = csort.filter((c) => c.author === reviewer);
            }

            // Filtering 'reply' comments into array.
            // TODO - make it so this seperates on punctuation
            const reply = /\[.*\]\(\s?#c(.*?)\)/;
            const isReply = (c) => reply.test(c.content);
            const replies = csort.filter(isReply).map((c) => {
                const match = reply.exec(c.content);
                c.replyTo = match[1].trim();
                c.isReply = true;
                return c;
            });

            // remove child comments.
            csort = csort.filter((c) => !isReply(c));

            if (byAuth) {
                csort = csort.filter((c) => c.author === byAuth);
            }

            if (bySlide) {
                csort = csort.filter((c) => {
                    const slides = c.slides.length > 0 ? c.slides : [];
                    const slideNos = slides.map((x) => x.slideNo);
                    return slideNos.includes(bySlide);
                });
            }

            if (byTag) {
                csort = csort.filter((c) => c.content.includes(byTag));
            }

            const items = csort.map((c, i) => {
                c.last = i === csort.length - 1; // no final hr
                c.active = c._id === activeComment; // highlight
                c.replies = replies.filter((r) => r.replyTo == c._id);
                return {
                    ...c,
                    key: c._id,
                    commentView: true,
                    focused: true,
                    allReplies: replies,
                };
            });

            const homeLink = window.location.origin + "/review/" + talk._id;
            return (
                <div>
                    <AlertLink
                        text={
                            "Open the talk page on SlideSpecs with this link."
                        }
                        link={homeLink}
                    />
                    <span className="comments-head" />
                    <CommentList title={"comments"} items={items} />
                    {items.length == 0 && (
                        <div className="alert"> no comments </div>
                    )}
                </div>
            );
        }
    };

    downloadHTML = () => {
        const renderComments = this.renderComments();
        const styleURL = document.querySelectorAll("link.__meteor-css__")[0]
            .href;
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
        const { talk } = this.props;
        const fname = `${talk.name}_comments.html`;
        const content = documentBody;
        this.createDownload({ fname, content, type: "text/html" });
    };

    httpGet = (theUrl) => {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", theUrl, false); // false for synchronous request
        xmlHttp.send(null);
        return xmlHttp.responseText;
    };

    // dev-html download end

    render() {
        const { uploading } = this.state;
        const { talk, talkId, sessionId, name, file, images, comments } =
            this.props;
        const hasComments = comments.length > 0;

        let talkFile;
        try {
            let fileParams = { "meta.talkId": talkId };
            talkFile = Files.findOne(fileParams).link("original", "//");
        } catch (e) {
            talkFile = "/404";
        }
        let imageSet = images.map((i, key) => (
            <SlideFile
                key={"file-" + key}
                iter={key + 1}
                fileUrl={Images.findOne(i._id).link("original", "//")}
                handleLoad={this.handleLoad}
                fileId={i._id}
                fileName={i.name}
            />
        ));

        const facilitateLink = window.location.origin + "/facilitate/" + talkId;
        const commentLink = window.location.origin + "/comment/" + talkId;
        const reviewLink = window.location.origin + "/review/" + talkId;
        // const uploadLink = window.location.origin + "/upload/" + talkId;
        // const downloadLink = `/download/${talkId}`;
        // const sessLink = `/sessions/${sessionId}`;
        const shareLink = `/share/${sessionId}`;
        const homeLink = shareLink;

        /*
                       <AlertLink
                    text={"Send to your discussion facilitator"}
                    bText={"open link"}
                    link={facilitateLink}
                    blank={true}
                />
        */
        const content = (
            <div className="main-content">
                {file && (
                    <small className="pull-right">
                        {images.length} slides, {comments.length} comments
                    </small>
                )}

                <h1>
                    <span className="black"> ‹ </span>
                    <LocalLink to={homeLink}>{name}</LocalLink>
                </h1>

                {!file && !uploading && (
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

                {!file && uploading && (
                    <div className="clearfix padded">
                        <FullMessage title="uploading presentation..." />
                    </div>
                )}

                <AlertLink
                    text={"Share this talk with a public link"}
                    bText={"open link"}
                    link={commentLink}
                />
                <AlertLink
                    text={"Facilitate a discussion for this talk"}
                    bText={"open link"}
                    link={facilitateLink}
                />

                {hasComments && (
                    <AlertLink
                        text={"Review comments and feedback"}
                        bText={"open link"}
                        link={reviewLink}
                    />
                )}

                {file && hasComments && (
                    <div className="btns-menu-space">
                        <button
                            onClick={this.downloadHTML}
                            className="btn btn-menu pull-right"
                        >
                            download comments
                        </button>

                        <a download href={talkFile}>
                            <button className="btn btn-menu pull-right">
                                download slides
                            </button>
                        </a>
                    </div>
                )}

                {file && images.length == 0 && (
                    <TalkListItem
                        className={"v-margin"}
                        talkId={talkId}
                        talk={talk}
                    />
                )}
                {file && images.length > 0 && (
                    <div className="v-pad">
                        <div className="v-margin">
                            <div id="grid">{imageSet}</div>
                        </div>
                    </div>
                )}
            </div>
        );

        return (
            this.renderRedirect() || (
                <MenuContainer {...this.props} content={content} />
            )
        );
    }
}

/*
                        <button
                            onClick={this.downloadJSON}
                            className="btn btn-menu btn-note"
                        >
                            download JSON
                        </button>
*/

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
