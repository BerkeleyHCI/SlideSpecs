/* global $ */
import React from "react";
import PropTypes from "prop-types";
import Markdown from "react-markdown";
import { toast } from "react-toastify";
// import ReactAudioPlayer from "react-audio-player";

import BaseComponent from "../components/BaseComponent.jsx";
import TextArea from "../components/TextArea.jsx";
import AppNotification from "../components/AppNotification.jsx";
import Expandable from "../components/Expandable.jsx";
import SlideTags from "../components/SlideTags.jsx";

// import { setRespondingComment } from "../../api/sessions/methods.js";

import {
    agreeComment,
    discussComment,
    updateComment,
    deleteComment,
    addressComment,
    completeComment,
} from "../../api/comments/methods.js";

const CommentButton = ({ _id, reviewer, icon, txt, handleClick, master }) => {
    return (
        <button
            title={txt}
            data-id={_id}
            data-auth={reviewer}
            data-toggle="tooltip"
            data-placement="top"
            onClick={handleClick}
            className={`btn btn-menu btn-list-item ${master && "btn-user"}`}
        >
            <i className={"fa fa-" + icon} />
        </button>
    );
};

class Comment extends BaseComponent {
    constructor(props) {
        super(props);
        this.editRef = React.createRef();
        this.state = { editing: false, replying: false };
    }

    componentDidMount = () => {
        const togs = $('[data-toggle="tooltip"]');
        togs.tooltip({
            trigger: "hover",
            template:
                '<div class="tooltip"><div class="tooltip-inner"></div></div>',
        });
    };

    goToElementId = (id) => {
        const view = document.getElementById(id);
        if (view) {
            view.scrollIntoView({ block: "center", inline: "center" });
        }
    };

    renderers = {
        link: (props) => {
            const { setActive, _id } = this.props;
            if (props.href[0] == "#") {
                const scrollView = (e) => {
                    e.preventDefault();
                    const tId = props.href.slice(1);
                    setActive(tId.slice(1));
                    this.goToElementId(tId);
                };
                return (
                    <a
                        key={props.children.toString() + _id}
                        className="internal reply"
                        onClick={scrollView}
                    >
                        {props.children} <i className={"fa fa-reply"} />
                    </a>
                );
            } else {
                return (
                    <a
                        href={props.href}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {props.children}
                    </a>
                );
            }
        },
        text: (props) => {
            // const { handleTag, setActive, _id } = this.props;
            const { handleTag } = this.props;
            const id = this.props._id;
            // split here for hashtag rendering
            // const words = props.split(/\s+|.,\/#!$%\^&\*;:{}=\-_`~()/).map((x, i) => {
            const words = props.split(/\s+/).map((x, i) => {
                if (x[0] == "#" && x.length > 1) {
                    return (
                        <span key={id + props + i}>
                            <a className="hashtag" onClick={handleTag}>
                                {x}{" "}
                            </a>
                        </span>
                    );
                } else {
                    return <span key={id + props + i}>{x} </span>;
                }
            });

            return <span key={id + props}>{words}</span>;
        },
    };

    setEdit = () => {
        const { content } = this.props;
        this.setState({ editing: true });
        setTimeout(() => {
            let eRef = this.editRef.current;
            eRef.value = content;
            eRef.focus();
        }, 50);
    };

    clearEdit = () => {
        this.setState({ editing: false });
    };

    confirmRemoveComment = () => {
        const { setModal, clearModal, content, replies } = this.props;
        let modalContent;
        if (replies.length > 0) {
            modalContent = {
                accept: clearModal,
                deny: clearModal,
                mtitle: "Comment cannot be removed as it has replies.",
                mtext: "You can edit the content of the comment to be blank, though.",
                act: "accept",
                isOpen: true,
            };
        } else {
            modalContent = {
                accept: this.removeComment,
                deny: clearModal,
                mtitle: "Delete this comment?",
                mtext: content,
                act: "delete",
                isOpen: true,
            };
        }
        setModal(modalContent);
    };

    removeComment = () => {
        const { _id, author } = this.props;
        deleteComment.call({ commentId: _id, author });
        this.props.clearModal();
    };

    handleEdit = () => {
        const newContent = this.editRef.current.value.trim();
        const { author, _id } = this.props;
        const editFields = {
            commentId: _id,
            newContent,
            author,
        };

        this.log({ type: "edit", ...editFields });
        updateComment.call(editFields, this.clearEdit);
        toast(() => (
            <AppNotification
                msg="updated"
                desc="Comment updated ok."
                icon="check"
            />
        ));
    };

    handleReply = () => {
        const { commentRef, author, _id } = this.props;
        const refText = ` [@${author}](#c${_id})`;
        const commText = commentRef.current;
        if (commText) {
            commText.scrollIntoView(false);
            if (!` ${commText.value}`.includes(refText)) {
                commText.value = (commText.value + refText).trim() + " ";
            }
            commText.focus();
        }
    };

    handleAgree = () => {
        const { reviewer, _id } = this.props;
        if (reviewer && _id) {
            const commentFields = {
                author: reviewer,
                commentId: _id,
            };

            //toast(() => (
            //<AppNotification
            //msg="Agreed"
            //desc="Agreed with comment."
            //icon="thumbs-up"
            ///>
            //));

            this.log({ type: "agree", ...commentFields });
            agreeComment.call(commentFields);
        }
    };

    handleDiscuss = () => {
        const { reviewer, _id } = this.props;
        if (reviewer && _id) {
            const commentFields = {
                author: reviewer,
                commentId: _id,
            };

            this.log({ type: "discuss", ...commentFields });
            discussComment.call(commentFields);
        }
    };

    handleAddress = () => {
        const { talk, _id } = this.props;
        this.log({ type: "address", talkId: talk, commentId: _id });
        addressComment.call({ commentId: _id });
    };

    handleComplete = () => {
        const { talk, _id } = this.props;
        this.log({ type: "complete", talkId: talk, commentId: _id });
        completeComment.call({ commentId: _id });
    };

    handleActiveComment = () => {
        const { discuss, talk, _id } = this.props;
        // const commentFields = {
        //     talkId: talk,
        //     commentId: _id,
        // };

        if (discuss.length == 0) {
            this.handleDiscuss();
        }

        if (talk && _id) {
            // this.log({ type: "setDiscussing", ...commentFields });
            // setRespondingComment.call(commentFields);
        }
    };

    handleQueue = () => {
        const { addressed, discuss } = this.props;
        if (addressed) {
            this.handleAddress();
        }
        if (discuss.length == 0) {
            this.handleDiscuss();
        }
    };

    handleFinishComment = () => {
        const { addressed } = this.props;
        this.handleActiveComment();
        if (!addressed) {
            this.handleAddress();
        }
    };

    pubButtons = [
        {
            handleClick: this.handleReply,
            icon: "reply",
            txt: "reply",
        },
        {
            handleClick: this.handleAgree,
            icon: "thumbs-up",
            txt: "agree",
        },
        {
            handleClick: this.handleDiscuss,
            icon: "comments",
            txt: "discuss",
        },
    ];

    editButton = {
        handleClick: this.setEdit,
        master: true,
        icon: "pencil",
        txt: "edit",
    };

    trashButton = {
        handleClick: this.confirmRemoveComment,
        master: true,
        icon: "trash",
        txt: "delete",
    };

    playButton = {
        handleClick: this.props.handlePlayAudio,
        icon: "play",
        txt: "play",
    };

    addressButton = {
        handleClick: this.handleAddress,
        master: true,
        icon: this.props.addressed ? "times" : "check",
        txt: this.props.addressed ? "undo" : "finish",
    };

    completeButton = {
        handleClick: this.handleComplete,
        master: true,
        icon: this.props.completed ? "times" : "check",
        txt: this.props.completed ? "undo" : "address",
    };

    activeButton = {
        handleClick: this.handleActiveComment,
        icon: "star",
        txt: "discuss",
    };

    queueButton = {
        handleClick: this.handleQueue,
        icon: "clock-o",
        txt: "queue",
    };

    // For active.
    finishButton = {
        handleClick: this.handleFinishComment,
        icon: "check",
        txt: "done",
    };

    privButtons = [this.editButton, this.trashButton];

    renderMeta = (tag, users) => {
        return (
            users.length > 0 && (
                <span className="meta">
                    <strong> {tag}: </strong>
                    {users.join(", ")}
                </span>
            )
        );
    };

    formatTime = (time) => {
        if (time < 0) {
            //console.error('negative comment region time: ', time);
            return null;
        }
        const secTime = time / 1000.0; // originally in millis
        const minutes = Math.floor(secTime / 60.0);
        const seconds = `${Math.floor(secTime % 60)}`.padStart(2, "0");
        const millis = ((secTime % 60) % 1).toFixed(1).substring(2);
        return `${minutes}:${seconds}.${millis}`;
    };

    renderTime = () => {
        const { startTime, stopTime } = this.props;
        if (!startTime || !stopTime) return null;
        return (
            <span className="meta">
                <strong> {this.formatTime(startTime)} </strong>—
                <strong> {this.formatTime(stopTime)} </strong>
            </span>
        );
    };

    renderComment = () => {
        const {
            _id,
            author,
            content,
            created,
            agree,
            active,
            discuss,
            focused,
            last,
            depth,
            reviewer,
            replies,
            isReply,
            userOwn,
            allReplies,
            addressed,
            bySlide,
            handleClick,
            handleAuthor,
            handleMouseOver,
            handleMouseOut,
            slides,
            handleSlideIn,
            handleSlideOut,
            clearButton,
            clearBySlide,
            setBySlide,
            wordList,
            activeComment,
            facilitateView,
            discussView,
            commentView,
            regionView,
            reviewView,
            responding,
        } = this.props;

        const master = author === reviewer;
        const facil = [reviewer, "audience", "SlideSpecs"];
        const toDiscuss = discuss.length > 0;
        const facilitatorAuth = facil.includes(author);
        const audio = author === "transcript";
        const base = depth === 0;
        let bData = [];

        if (commentView && master) {
            bData = [...this.pubButtons, ...this.privButtons];
        } else if (commentView) {
            bData = [...this.pubButtons];
        } else if (facilitateView && base && responding && facilitatorAuth) {
            bData = [this.finishButton, this.editButton];
        } else if (facilitateView && base && responding) {
            bData = [this.finishButton]; // responding
        } else if (facilitateView && base && addressed && facilitatorAuth) {
            bData = [this.activeButton, this.queueButton, this.editButton]; // discussed
        } else if (facilitateView && base && addressed) {
            bData = [this.activeButton, this.queueButton]; // discussed
        } else if (facilitateView && base && toDiscuss && facilitatorAuth) {
            bData = [this.activeButton, this.addressButton, this.editButton]; // to discuss
        } else if (facilitateView && base && toDiscuss) {
            bData = [this.activeButton, this.addressButton]; // to discuss
        } else if (facilitateView && base) {
            bData = [this.activeButton, this.queueButton]; // unmarked
        } else if (facilitateView) {
            bData = []; // reply.
        } else if (discussView && master) {
            bData = [this.addressButton, this.editButton];
        } else if (discussView) {
            bData = [this.addressButton];
        } else if (regionView) {
            bData = [this.playButton];
        } else if (reviewView && base) {
            //bData = [this.completeButton, this.trashButton];
            bData = [];
        } else if (reviewView && audio) {
            //bData = [this.trashButton];
            bData = [];
        }

        const context = (
            <SlideTags
                done={true}
                slides={slides}
                bySlide={bySlide}
                handleSlideIn={handleSlideIn}
                handleSlideOut={handleSlideOut}
                clearButton={clearButton}
                clearBySlide={clearBySlide}
                setBySlide={setBySlide}
            />
        );

        // always sort replies by time.
        const replyProps = replies
            .sort((a, b) => a.created > b.created)
            .map((c, i) => {
                return {
                    ...c,
                    isReply: true,
                    key: i + c._id,
                    depth: depth + 1,
                    replies: allReplies.filter((r) => r.replyTo == c._id),
                    active: c._id === activeComment,
                    last: false,
                };
            });

        return (
            <div>
                <div
                    id={"c" + _id}
                    onBlur={this.clearEdit}
                    onMouseOver={handleMouseOver}
                    onMouseOut={handleMouseOut}
                    onClick={handleClick}
                    className={
                        "clearfix comment " +
                        (last ? " last-comment" : "") +
                        (active ? " active-comment" : "") +
                        (isReply ? ` reply-comment-${depth}` : "")
                    }
                >
                    {!focused && bData.length > 0 && (
                        <div className="hover-menu">
                            <div className="btn-group btns-empty">
                                {bData.map((button, i) => (
                                    <CommentButton
                                        reviewer={reviewer}
                                        _id={_id}
                                        {...button}
                                        key={i}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="pull-right">{context}</div>
                    <strong
                        data-auth={author}
                        className="author"
                        onClick={handleAuthor}
                    >
                        {author}
                    </strong>
                    <small>
                        {!regionView && created.toLocaleTimeString()}
                        {userOwn && (
                            <span>
                                {" "}
                                <i className={"fa fa-lock"} />{" "}
                            </span>
                        )}
                        {!regionView && (
                            <span>
                                {agree && this.renderMeta("agreed", agree)}
                                {discuss && this.renderMeta("discuss", discuss)}
                            </span>
                        )}
                        {regionView && this.renderTime()}
                    </small>

                    <br />
                    <Markdown
                        className="markdown-comment"
                        disallowedTypes={["image", "imageReference"]}
                        unwrapDisallowed={true}
                        renderers={this.renderers}
                        source={content}
                    />

                    {base && wordList && (
                        <span>
                            <hr />
                            <Expandable>{wordList}</Expandable>
                        </span>
                    )}

                    {!last && <hr />}
                </div>

                <div>
                    {replyProps.map((rp, i) => (
                        <Comment key={`comment-${i}`} {...this.props} {...rp} />
                    ))}
                </div>
            </div>
        );
    };

    renderEditor = () => {
        const { author } = this.props;
        return (
            <div onBlur={this.clearEdit} className="clearfix comment editing">
                <strong>{author}</strong> · <i> editing... </i>
                <button onClick={this.clearEdit} className="btn pull-right">
                    cancel
                </button>
                <br />
                <TextArea
                    inRef={this.editRef}
                    onBlur={this.clearEdit}
                    handleSubmit={this.handleEdit}
                />
            </div>
        );
    };

    render() {
        const { editing } = this.state;
        return editing ? this.renderEditor() : this.renderComment();
    }
}

Comment.propTypes = {
    allReplies: PropTypes.array,
    isReply: PropTypes.bool,
    replies: PropTypes.array,
};

Comment.defaultProps = {
    allReplies: [],
    isReply: false,
    wordList: false,
    replies: [],
    depth: 0,
};

export default Comment;
