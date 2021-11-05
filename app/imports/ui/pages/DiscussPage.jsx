import { Meteor } from "meteor/meteor";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { Session } from "meteor/session.js";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import _ from "lodash";

import { Images } from "../../api/images/images.js";
import BaseComponent from "../components/BaseComponent.jsx";
import AlertLink from "../components/AlertLink.jsx";
import LocalLink from "../components/LocalLink.jsx";
import CommentList from "../components/CommentList.jsx";
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

class DiscussPage extends BaseComponent {
    constructor(props) {
        super(props);
        this.inRef = React.createRef();
        this.state = {
            redirectTo: null,
            sorter: "flag",
            filter: "flag",
            invert: true,
            bySlide: "",
            byAuth: "",
            byTag: "",
            hoverImage: "",
            image: "",
        };
    }

    handleLoad = () => {
        const grid = document.getElementById("grid");
        const mason = new Masonry(grid, {
            itemSelector: ".file-item",
        });
    };

    extractFileData = (x) => {
        return {
            slideId: x.getAttribute("data-file-id"),
            slideNo: x.getAttribute("data-iter"),
        };
    };

    handleTagIn = (e) => {
        if (e.target === e.currentTarget) {
            const data = this.extractFileData(e.target);
            const id = data.slideId;
            try {
                const { image, hoverImage } = this.state;
                const newhoverImage = Images.findOne(id).link("original", "//");
                if (newhoverImage) {
                    if (newhoverImage !== image)
                        this.setState({ image: newhoverImage });
                    if (newhoverImage !== hoverImage)
                        this.setState({ hoverImage: newhoverImage });
                }
            } catch (e) {
                console.error(e);
            }
        }
    };

    componentDidMount = () => {
        // set image to link of the first slide
        this.handleLoad(); // masonry
        const { images } = this.props;
        if (images.length > 0) {
            this.updateImage(images[0]._id);
        }
    };

    setByAuth = (e) => {
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

    setBySlide = (e) => {
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
    setByTag = (e) => {
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

    updateImage = (fid) => {
        const link = Images.findOne({ _id: fid }).link("original", "//");
        this.setState({ image: link });
    };

    updateHoverImage = (link) => {
        this.setState({ hoverImage: link, image: link });
    };

    handleSlideIn = (e) => {
        const src = e.target.querySelector("img").src;
        if (src) this.updateHoverImage(src);
    };

    handleSlideOut = (e) => {
        this.setState({ hoverImage: false });
    };

    renderCommentFilter = () => {
        const filterer = this.renderFilter();
        return filterer;
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
        let { byAuth, bySlide, byTag } = this.state;
        const sType = bySlide === "general" ? "scope" : "slide";
        const { browserSupportsSpeechRecognition } = this.props;
        if (bySlide) bySlide = <kbd>{bySlide}</kbd>;

        return (
            <div className="filterer alert clearfix">
                <ClearingDiv set={byTag} pre="tag" clear={this.clearByTag} />
                <ClearingDiv
                    set={byAuth}
                    pre="author"
                    clear={this.clearByAuth}
                />
                <ClearingDiv
                    set={bySlide}
                    pre={sType}
                    clear={this.clearBySlide}
                />
            </div>
        );
    };

    renderCommentData = (arr, replies, c, i) => {
        const { sessionId, comments, reviewer, setModal, clearModal } =
            this.props;
        const { sorter, invert, byAuth, bySlide, byTag } = this.state;
        c.last = i === arr.length - 1; // no final hr
        c.replies = replies.filter((r) => r.replyTo == c._id);
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
            handleSlideIn: this.handleTagIn,
            handleSlideOut: this.handleSlideOut,
            clearButton: this.clearButton,
            clearBySlide: this.clearBySlide,
            setBySlide: this.setBySlide,
            bySlide,
            byAuth,
            byTag,
        };
    };

    renderComments = () => {
        const { sorter, invert, byAuth, bySlide, byTag } = this.state;
        const { talk, comments, reviewer, setModal, clearModal } = this.props;
        if (!comments || !comments.length) {
            return <div className="alert"> no comments yet</div>;
        } else {
            let csort = _.orderBy(
                comments,
                [sorter, "created"],
                [invert ? "desc" : "asc", "asc"]
            );

            // Clean - filter out those without discuss.
            csort = csort.filter((c) => c.discuss.length > 0);

            // Clean - filter out active responding comment.
            // // TODO update for multiple
            csort = csort.filter((c) => c._id !== talk.active);

            if (!csort || !csort.length) {
                return (
                    <div className="centered">no discussion comments yet</div>
                );
            }

            // Filtering 'reply' comments into array.
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

            // Clean - filter out active responding comments.
            csort = csort.filter((c) => talk.active.indexOf(c._id) < 0);

            // split off 'addressed' comments
            const addressed = csort.filter((c) => c.addressed);
            csort = csort.filter((c) => !c.addressed);

            if (byAuth) {
                csort = csort.filter((c) => c.author === byAuth);
            }

            if (bySlide) {
                csort = csort.filter((c) => {
                    const general = [{ slideNo: "general" }];
                    const slides = c.slides.length > 0 ? c.slides : general;
                    const slideNos = slides.map((x) => x.slideNo);
                    return slideNos.includes(bySlide);
                });
            }

            if (byTag) {
                csort = csort.filter((c) => c.content.includes(byTag));
            }

            const items = csort.map((c, i) =>
                this.renderCommentData(csort, replies, c, i)
            );

            const addressedItems = addressed.map((c, i) =>
                this.renderCommentData(addressed, replies, c, i)
            );

            return (
                <div>
                    <span className="comments-head" />
                    <CommentList
                        title={"to discuss"}
                        items={items}
                        focused={true}
                    />
                    <CommentList
                        title={"discussed"}
                        items={addressedItems}
                        focused={true}
                    />
                </div>
            );
        }
    };

    renderContext = () => {
        const fileList = this.renderFiles();
        const { image, hoverImage, bySlide } = this.state;
        const { name, talk, reviewer, sessionOwner } = this.props;
        const cmtHead = this.renderCommentFilter();
        const imgSrc = hoverImage ? hoverImage : image;

        return (
            <div className="context-filter float-at-top">
                <span className="list-title list-title-basic">
                    {sessionOwner && (
                        <Link to={`/talk/${talk._id}`}>
                            <span className="black"> ‹ </span>
                            {name}
                        </Link>
                    )}
                    {!sessionOwner && name}
                    <span
                        onClick={this.clearReviewer}
                        className="pull-right clear-icon"
                    >
                        {reviewer}
                    </span>
                </span>
                <Img className="big-slide" source={imgSrc} />
                <div id="grid-holder">
                    <div id="grid">{fileList}</div>
                </div>
                {cmtHead}
                <div id="v-pad" />
            </div>
        );
    };

    renderRespond = () => {
        const { talk } = this.props;
        if (!talk.active) return null;
        let activeFix = _.flatten([talk.active]);
        const respond = Comments.find({ _id: { $in: activeFix } }).fetch();
        if (!respond || !respond.length) return null;
        const props = {
            commentRef: this.inRef,
            handleTag: this.setByTag,
            handleAuthor: this.setByAuth,
            handleSlideIn: this.handleTagIn,
            handleSlideOut: this.handleSlideOut,
            clearButton: this.clearButton,
            clearBySlide: this.clearBySlide,
            setBySlide: this.setBySlide,
        };
        return (
            <div className="alert float-at-top discuss-comments">
                <div id="comments-list" className="alert no-margin">
                    {respond.map((i, iter) => (
                        <Comment
                            {...i}
                            {...props}
                            focused={true}
                            last={iter + 1 == respond.length}
                            key={`discuss-${iter}`}
                            iter={iter}
                        />
                    ))}
                </div>
            </div>
        );
    };

    render() {
        const { images, talk } = this.props;
        const context = this.renderContext();
        const respond = this.renderRespond();
        const comments = this.renderComments();

        return images ? (
            this.renderRedirect() || (
                <div className="reviewView">
                    <div id="review-view" className="table review-table">
                        <div className="row">
                            <div className="col-sm-5 full-height-md no-float">
                                {context}
                            </div>
                            <div className="col-sm-7">
                                {respond}
                                <div id="v-pad clearfix" />
                                <div className="padded">
                                    <LocalLink to={`/comment/${talk._id}`}>
                                        <div className="centered">
                                            return to commenting
                                        </div>
                                    </LocalLink>
                                </div>
                                {comments}
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

export default DiscussPage;
