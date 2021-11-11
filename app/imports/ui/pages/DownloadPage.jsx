import React from "react";
import _ from "lodash";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import AppNotification from "../components/AppNotification.jsx";
import BaseComponent from "../components/BaseComponent.jsx";
import ClearingDiv from "../components/ClearingDiv.jsx";
import Comment from "../components/Comment.jsx";

// Control-log.
import { Logger } from "meteor/ostrio:logger";
import { LoggerConsole } from "meteor/ostrio:loggerconsole";

class DownloadPage extends BaseComponent {
    constructor(props) {
        super(props);

        // Control-log.
        this.logger = new Logger();
        new LoggerConsole(this.logger).enable();

        this.state = {
            defaultPriv: false,
            following: true,
            focusing: true,
            userOwn: false,
            redirectTo: null,
            sorter: "created",
            filter: "time",
            invert: true,
            tags: [],
            bySlide: "",
            byAuth: "",
            byTag: "",
        };
    }

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

    filterComment = (c) => {
        let newComment = _.pick(c, [
            "author",
            "content",
            "created",
            "agree",
            "discuss",
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
        const filtered = comments.filter(notReply).map(this.filterComment);
        const fname = `${talk.name}_comments.json`;
        const content = JSON.stringify(filtered, null, 2);

        this.createDownload({ fname, content, type: "application/json" });
    };

    downloadHTML = () => {
        const { talk } = this.props;
        const fname = `${talk.name}_comments.html`;
        const content = document.documentElement.innerHTML;
        // const content = document.getElementById("comment-main").innerHTML;
        this.createDownload({ fname, content, type: "text/html" });
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

    renderDownload = () => {
        return (
            <div className="btns-group">
                <button onClick={this.downloadJSON} className="btn btn-empty">
                    download JSON
                </button>
                <button onClick={this.downloadHTML} className="btn btn-empty">
                    download HTML
                </button>
            </div>
        );
    };

    renderCommentFilter = () => {
        const filterer = this.renderFilter();

        const { invert, filter } = this.state;
        const invFn = () => this.setState({ invert: !invert });
        const setSort = (s, f) => {
            return () => this.setState({ sorter: s, filter: f });
        };

        const timeSort = setSort("created", "time");
        const authSort = setSort((x) => x.author.toLowerCase(), "auth");
        const agreeSort = setSort((x) => (x.agree || []).length, "agree");
        const flagSort = setSort((x) => (x.discuss || []).length, "flag");
        const slideSort = setSort(
            (x) => (x.slides[0] ? Number(x.slides[0].slideNo) : Infinity),
            "slide"
        );

        return (
            <div>
                <div className="btn-m-group btns-group">
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
                            "btn btn-menu" +
                            (filter === "agree" ? " active" : "")
                        }
                        onClick={agreeSort}
                    >
                        agree
                    </button>
                    <button
                        className={
                            "btn btn-menu" +
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

    renderFilter = () => {
        const tagList = this.renderTags();
        let { byAuth, bySlide, byTag } = this.state;
        const sType = bySlide === "general" ? "scope" : "slide";
        if (bySlide) bySlide = <kbd>{bySlide}</kbd>;

        return (
            <div className="filterer">
                <p> {tagList} </p>
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
                <hr />
            </div>
        );
    };

    renderTags = () => {
        const { comments } = this.props;
        const getTag = (t) =>
            t.split(/\s/).filter((t) => t[0] == "#" && t.length > 1);
        const alltags = comments.map((c) => getTag(c.content));
        const unique = _.uniq(_.flatten(alltags));
        return unique.map((tag) => (
            <a key={tag} onClick={this.insertTag} className="tag-link">
                {tag}
            </a>
        ));
    };

    renderComments = () => {
        const { sorter, invert, userOwn, byAuth, bySlide, byTag } = this.state;
        const { sessionId, comments, reviewer, setModal, clearModal } =
            this.props;
        if (!comments || !comments.length) {
            return <div className="alert"> no comments yet</div>;
        } else {
            let csort = _.orderBy(
                comments,
                [sorter, "created"],
                [invert ? "desc" : "asc", "asc"]
            );

            // Focus view filtering - omit replies.
            if (userOwn) {
                csort = csort.filter((c) => c.author === reviewer);
            }

            // Filtering 'reply' comments into array. HATE.
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
                    const general = [{ slideNo: "general" }];
                    const slides = c.slides.length > 0 ? c.slides : general;
                    const slideNos = slides.map((x) => x.slideNo);
                    return slideNos.includes(bySlide);
                });
            }

            if (byTag) {
                csort = csort.filter((c) => c.content.includes(byTag));
            }

            const items = csort.map((c, i) => {
                c.last = i === csort.length - 1; // no final hr
                c.replies = replies.filter((r) => r.replyTo == c._id);
                return {
                    ...c,
                    key: c._id,
                    reviewer,
                    setModal,
                    sessionId,
                    clearModal,
                    log: this.log,
                    focused: true,
                    bySlide: bySlide,
                    allReplies: replies,
                    handleTag: this.setByTag,
                    handleAuthor: this.setByAuth,
                    clearButton: this.clearButton,
                    clearBySlide: this.clearBySlide,
                    setBySlide: this.setBySlide,
                };
            });

            const cmtHead = this.renderCommentFilter();
            return (
                <div>
                    <div className="comments-list alert">
                        {cmtHead}
                        <div id="comment-main">
                            {items.map((i, iter) => (
                                <Comment key={`comment-${iter}`} {...i} />
                            ))}
                        </div>
                    </div>
                    {items.length == 0 && (
                        <div className="alert"> no comments</div>
                    )}
                </div>
            );
        }
    };

    render() {
        const { files, session, talk } = this.props;
        const download = this.renderDownload();
        const comments = this.renderComments();

        return files ? (
            this.renderRedirect() || (
                <div className="main-content reviewView">
                    <div id="review-view" className="table review-table">
                        <div className="row">
                            <div className="col-sm-12">
                                <h1>
                                    <span className="black"> ‹ </span>
                                    <Link to={`/slides/${talk._id}`}>
                                        {session.name}
                                    </Link>
                                    <small> / {talk.name}</small>
                                </h1>
                                {download}

                                {comments}
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

export default DownloadPage;
