/* global Masonry */

import { Meteor } from "meteor/meteor";
import React, { Fragment } from "react";
import { Session } from "meteor/session.js";
import _ from "lodash";

import { Images } from "../../api/images/images.js";
import AlertLink from "../components/AlertLink.jsx";
import LocalLink from "../components/LocalLink.jsx";
import CommentList from "../components/CommentList.jsx";
import BaseComponent from "../components/BaseComponent.jsx";
import TextArea from "../components/TextArea.jsx";
import SlideTags from "../components/SlideTags.jsx";
import ClearingDiv from "../components/ClearingDiv.jsx";
import FileReview from "../components/FileReview.jsx";
import Clock from "../components/Clock.jsx";
import Img from "../components/Image.jsx";
// import Comment from "../components/Comment.jsx";

import { createComment } from "../../api/comments/methods.js";

class CommentPage extends BaseComponent {
    constructor(props) {
        super(props);
        this.inRef = React.createRef();
        this.state = {
            defaultPriv: false,
            following: false,
            focusing: false,
            userOwn: false,
            redirectTo: null,
            activeComment: null,
            sorter: "created",
            filter: "time",
            invert: true,
            selected: [],
            tags: [],
            bySlide: "",
            byAuth: "",
            byTag: "",
            hoverImage: "",
            image: "",
        };
    }

    handleLoad = () => {
        const grid = document.getElementById("grid");
        const itemSel = { itemSelector: ".file-item" };
        new Masonry(grid, itemSel);
    };

    log = (data) => {
        //console.log(data);
        const { reviewer, sessionId } = this.props;
        if (typeof data === "string") {
            this.logger.info(
                JSON.stringify({ data, reviewer, sessionId, time: Date.now() })
            );
        } else if (Object.keys.length > 0) {
            this.logger.info(
                JSON.stringify({
                    ...data,
                    reviewer,
                    sessionId,
                    time: Date.now(),
                })
            );
        } else {
            this.logger.info(
                JSON.stringify({ data, reviewer, sessionId, time: Date.now() })
            );
        }
    };

    extractFileData = (x) => {
        return {
            slideId: x.getAttribute("data-file-id"),
            slideNo: x.getAttribute("data-iter"),
        };
    };

    componentDidMount = () => {
        this.handleLoad();
        document.getElementById("review-view").focus();
        document.addEventListener("keydown", this.handleKeyDown);

        // set image to link of the first slide
        const { images } = this.props;
        if (images.length > 0) {
            this.updateImage(images[0]._id);
        }
    };

    componentDidUpdate = () => {
        this.handleLoad();
    };

    componentWillUnmount = () => {
        // document.removeListener("keydown", this.handleKeyDown);
    };

    setActiveComment = (ac) => {
        this.setState({ activeComment: ac });
    };

    clearActiveComment = () => {
        this.setState({ activeComment: "" });
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

    // click on tag in filter
    insertTag = (e) => {
        e.preventDefault();
        const tag = e.target.innerText.trim();
        const textarea = this.inRef.current;
        if (textarea.value === "") {
            textarea.value = `${tag} `;
        } else if (!textarea.value.includes(tag)) {
            textarea.value += ` ${tag} `;
        }
        textarea.focus();
    };

    clearByTag = () => {
        this.setState({ byTag: "" });
    };

    clearReviewer = () => {
        Meteor.logout(() => {
            localStorage.setItem("feedbacks.referringLink", "");
            localStorage.setItem("feedbacks.reviewer", null);
            Session.set("reviewer", null);
        }); // clear
    };

    updateImage = (id) => {
        try {
            this.setState({
                image: Images.findOne({ _id: id }).link("original", "//"),
            });
        } catch (e) {
            console.error(e);
        }
    };

    updateHoverImageLink = (link) => {
        const { image, selected } = this.state;
        this.setState({ hoverImage: link });
        if (link && link !== image && selected.length === 0) {
            this.setState({ image: link });
        }
    };

    updateHoverImage = (id) => {
        try {
            const { image, selected } = this.state;
            const hoverImage = Images.findOne({ _id: id }).link(
                "original",
                "//"
            );
            this.setState({ hoverImage });
            if (hoverImage && hoverImage !== image && selected.length === 0) {
                this.setState({ image: hoverImage });
            }
        } catch (e) {
            console.error(e);
        }
    };

    handleSlideIn = (e) => {
        if (e.target === e.currentTarget) {
            const data = this.extractFileData(e.target);
            this.updateHoverImage(data.slideId);
        }
    };

    handleSlideOut = () => {
        this.setState({ hoverImage: "" });
    };

    handleMouseOver = (link) => {
        this.updateHoverImageLink(link);
    };

    handleMouseOut = () => {
        this.setState({ hoverImage: "" });
    };

    clearText = () => {
        const textarea = this.inRef.current;
        textarea.value = "";
        textarea.focus();
    };

    clearSelection = () => {
        this.setState({ filtered: [], selected: [] });
    };

    clearButtonBG = (e) => {
        this.clearActiveComment();
        const base = e.target.className.split()[0];
        const matches = [
            /col-/,
            /review-table/,
            /row/,
            /reviewView/,
            /clearComment/,
        ].some((x) => base.match(x));

        if (matches) {
            this.clearButton();
        }
    };

    clearButton = () => {
        this.clearSelection();
    };

    clearGrid = (e) => {
        e.preventDefault();
        if (e.target === e.currentTarget) {
            this.clearSelection();
        }
    };

    addComment = () => {
        // const { defaultPriv } = this.state;
        const { reviewer, talkId, sessionId } = this.props;
        const slides = this.state.selected;
        const cText = this.inRef.current.value.trim();
        const priv = cText.includes("#private");
        const commentFields = {
            author: reviewer,
            content: cText,
            session: sessionId,
            talk: talkId,
            userOwn: priv, // defaultPriv || priv,
            slides,
        };

        createComment.call(commentFields, (err) => {
            if (err) {
                console.error(err);
            } else {
                this.clearButton();
                this.clearText();
            }
        });
    };

    togglePrivate = () => {
        const defaultPriv = !this.state.defaultPriv;
        this.setState({ defaultPriv });
    };

    toggleFocus = () => {
        const focusing = !this.state.focusing;
        this.setState({ focusing });
    };

    toggleUserOwn = () => {
        const userOwn = !this.state.userOwn;
        this.setState({ userOwn });
    };

    renderCommentHead = () => {
        const { talk } = this.props;
        const { focusing, userOwn } = this.state;
        return (
            <span className="comment-config pull-right">
                <span className="comment-option" onClick={this.toggleFocus}>
                    <i className={"fa fa-" + (focusing ? "eye" : "comments")} />{" "}
                    {focusing ? "focus" : "share"}
                </span>{" "}
                <span className="comment-option" onClick={this.toggleUserOwn}>
                    <i className={"fa fa-" + (userOwn ? "user" : "globe")} />{" "}
                    {userOwn ? "mine" : "all"}
                </span>{" "}
                <span
                    className="comment-option"
                    onClick={() => this.redirectTo(`/discuss/${talk._id}`)}
                >
                    discuss
                </span>
            </span>
        );
    };

    /*
<span className="comment-option" onClick={this.togglePrivate}>
  <i className={'fa fa-' + (defaultPriv ? 'lock' : 'globe')} />{' '}
  {defaultPriv ? 'private' : 'public'}
</span>{' '}
|{' '}
{' '}|{' '}
<span className="comment-option" onClick={this.toggleFollow}>
<i className={'fa fa-' + (following ? 'image' : 'tag')} />{' '}
{following ? 'auto' : 'manual'}
</span>
*/

    renderCommentFilter = () => {
        const filterer = this.renderFilter();

        const { invert, filter } = this.state;
        const invFn = () => this.setState({ invert: !invert });
        const setSort = (s, f) => {
            return () => this.setState({ sorter: s, filter: f });
        };

        const timeSort = setSort("created", "time", invert);
        const authSort = setSort((x) => x.author.toLowerCase(), "auth", false);
        const agreeSort = setSort((x) => (x.agree || []).length, "agree", true);
        const flagSort = setSort((x) => (x.discuss || []).length, "flag", true);
        const slideSort = setSort(
            (x) => (x.slides[0] ? Number(x.slides[0].slideNo) : Infinity),
            "slide",
            false
        );

        return (
            <div className="float-at-top">
                <div className="btn-m-straight btn-m-group btns-group">
                    <button
                        onClick={timeSort}
                        className={
                            "btn btn-menu" +
                            (filter === "time" ? " active" : "")
                        }
                    >
                        time
                    </button>
                    <button
                        className={
                            "btn btn-menu" +
                            (filter === "slide" ? " active" : "")
                        }
                        onClick={slideSort}
                    >
                        slide
                    </button>
                    <button
                        className={
                            "btn btn-menu" +
                            (filter === "auth" ? " active" : "")
                        }
                        onClick={authSort}
                    >
                        author
                    </button>
                    <button
                        className={
                            "hidden-small btn btn-menu" +
                            (filter === "agree" ? " active" : "")
                        }
                        onClick={agreeSort}
                    >
                        agree
                    </button>
                    <button
                        className={
                            "hidden-small btn btn-menu" +
                            (filter === "flag" ? " active" : "")
                        }
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

    updateSelected = (event, image) => {
        const { selected } = this.state;
        const newSlide = {
            slideId: image._id,
            slideNo: `${+image.meta.slideNo + 1}`,
        };

        // update static image
        this.updateImage(image._id);

        if (event.shiftKey || event.metaKey) {
            // adding item to list, or removing item if already in it
            if (selected.some((s) => s.slideId === newSlide.slideId)) {
                const newSelect = selected.filter(
                    (s) => s.slideId !== newSlide.slideId
                );
                this.setState({ selected: newSelect });
            } else {
                this.setState({ selected: [...selected, newSlide] });
            }
        } else {
            // set list to just be this item
            this.setState({ selected: [newSlide] });
        }
    };

    renderSubmit = () => {
        const { defaultPriv } = this.state;
        return (
            <div className="submitter">
                {defaultPriv && (
                    <i className="pull-right fa fa-lock textarea-icon" />
                )}
                <TextArea
                    inRef={this.inRef}
                    handleSubmit={this.addComment}
                    defaultValue="Add feedback here."
                    className="code comment-text"
                />
            </div>
        );
    };

    renderFiles = () => {
        const { selected } = this.state;
        const { images } = this.props;
        if (!images) return;
        return images.map((f, key) => {
            let link = "404";
            try {
                link = Images.findOne({ _id: f._id }).link("original", "//");
            } catch (e) {
                console.error(e);
            }

            const active = selected.some((s) => s.slideId == f._id);
            const setHover = _.throttle(() => this.handleMouseOver(link), 100);
            const setSelect = (e) => this.updateSelected(e, f);
            return (
                <FileReview
                    key={"file-" + key}
                    iter={key + 1}
                    fileUrl={link}
                    fileId={f._id}
                    fileName={f.name}
                    active={active}
                    handleMouse={setHover}
                    handleClick={setSelect}
                    handleMouseOut={this.handleMouseOut}
                    handleLoad={this.handleLoad}
                />
            );
        });
    };

    renderFilter = () => {
        const cHead = this.renderCommentHead();
        const submitter = this.renderSubmit();
        const tagList = this.renderTags();
        let { byAuth, bySlide, byTag } = this.state;
        if (bySlide) bySlide = <kbd>{bySlide}</kbd>;
        return (
            <div className="filterer alert">
                <p>
                    {cHead}
                    <Clock className="hidden-small" />
                </p>
                {tagList.length > 0 && (
                    <Fragment>
                        <hr />
                        <p> {tagList} </p>
                    </Fragment>
                )}
                <ClearingDiv set={byTag} pre="tag" clear={this.clearByTag} />
                <ClearingDiv
                    set={byAuth}
                    pre="author"
                    clear={this.clearByAuth}
                />
                <ClearingDiv
                    set={bySlide}
                    pre="slide"
                    clear={this.clearBySlide}
                />
                <hr />
                {submitter}
            </div>
        );
    };

    renderTags = () => {
        const { comments } = this.props;
        const getTag = (t) =>
            t.split(/\s/).filter((t) => t[0] == "#" && t.length > 1);
        const alltags = comments.map((c) => getTag(c.content));
        const unique = _.uniq(_.flatten(alltags)).filter(
            (t) => t !== "#private"
        );
        return unique.map((tag) => (
            <a key={tag} onClick={this.insertTag} className="tag-link">
                {tag}
            </a>
        ));
    };

    handleCommentClick = (c) => {
        if (!c || !c.slides || c.slides.length == 0) return;
        const [first] = c.slides;
        this.updateHoverImage(first.slideId);
    };

    goToTop = () => {
        const view = document.getElementsByClassName("comments-head");
        if (view[0]) {
            view[0].scrollIntoView({ block: "center", inline: "center" });
        }
    };

    renderComments = () => {
        const {
            sorter,
            invert,
            activeComment,
            focusing,
            userOwn,
            byAuth,
            bySlide,
            byTag,
        } = this.state;
        const { comments, reviewer, setModal, clearModal } = this.props;
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

            // TODO - make it so this seperates on punctuation

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
                c.handleClick = () => this.handleCommentClick(c);
                return {
                    ...c,
                    key: c._id,
                    commentView: true,
                    reviewer,
                    setModal,
                    clearModal,
                    activeComment,
                    log: this.log,
                    focused: focusing,
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
                    <span className="comments-head" />
                    <CommentList title={"Comments"} items={items} />
                    {items.length == 0 && (
                        <div className="alert"> no comments</div>
                    )}
                </div>
            );
        }
    };

    renderContext = () => {
        const fileList = this.renderFiles();
        const { image, hoverImage, selected, bySlide } = this.state;
        const { name, sessionId, reviewer } = this.props;
        const imgSrc = hoverImage ? hoverImage : image;

        return (
            <div className="context-filter float-at-top">
                <span className="list-title list-title-basic">
                    <span className="black"> ‹ </span>
                    <LocalLink to={`/share/${sessionId}`}>{name}</LocalLink>
                    <span
                        onClick={this.clearReviewer}
                        className="pull-right clear-icon"
                    >
                        {reviewer}
                    </span>
                </span>
                <Img className="big-slide float-at-top" source={imgSrc} />
                <div id="grid-holder">
                    <div
                        id="grid"
                        onMouseDown={this.clearGrid}
                        onMouseOut={this.handleMouseOut}
                    >
                        {fileList}
                    </div>
                </div>
                {selected.length > 0 && (
                    <div>
                        <div className="v-pad" />
                        <div className="no-margin clearfix alert bottom">
                            <SlideTags
                                slides={selected}
                                bySlide={bySlide}
                                clearButton={this.clearButton}
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    };

    moveSlideUpdate = (inc) => {
        const { images } = this.props;
        const { selected } = this.state;
        const [first] = selected;
        const firstNo = !first ? 1 : +first.slideNo + inc;
        if (firstNo > images.length || firstNo == 0) return;
        const image = images[firstNo - 1];
        //const [item] = document.getElementsByClassName('file-item-review active');
        //if (item) item.scrollIntoView();
        this.setState({
            selected: [{ slideNo: `${firstNo}`, slideId: image._id }],
        });
        this.updateImage(image._id);
    };

    handleKeyDown = (event) => {
        if (event.target.type === "textarea") {
            return; // don't change if writing
        }

        switch (event.keyCode) {
            //case 32:
            ////console.log('space key pressed');
            //event.preventDefault();
            //event.stopPropagation();
            //return;
            //break;
            case 37:
            case 38:
                // console.log("Left key pressed");
                event.preventDefault();
                event.stopPropagation();
                this.moveSlideUpdate(-1);
                break;
            case 39:
            case 40:
                // console.log("Right key pressed");
                event.preventDefault();
                event.stopPropagation();
                this.moveSlideUpdate(+1);
                break;
        }
    };

    renderDownload = () => {
        const { talk, talkOwner } = this.props;
        const dlLink = `/download/${talk._id}`;
        return (
            talkOwner && (
                <AlertLink
                    center={true}
                    text={"download comments"}
                    link={dlLink}
                />
            )
        );
    };

    render = () => {
        const { images } = this.props;
        const cmtHead = this.renderCommentFilter();
        const comments = this.renderComments();
        const download = this.renderDownload();
        const context = this.renderContext();

        return images ? (
            this.renderRedirect() || (
                <div className="reviewView" onMouseDown={this.clearButtonBG}>
                    <div id="review-view" className="table review-table">
                        <div className="row">
                            <div className="col-sm-5 full-height-md no-float">
                                {context}
                            </div>
                            <div className="col-sm-7">
                                {cmtHead}
                                {download}
                                {comments}
                            </div>
                        </div>
                    </div>
                </div>
            )
        ) : (
            <div>waiting for slides...</div>
        );
    };
}

export default CommentPage;
