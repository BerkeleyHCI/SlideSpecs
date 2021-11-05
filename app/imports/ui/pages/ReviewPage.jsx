import { Meteor } from "meteor/meteor";
import React, { Component } from "react";
import { Session } from "meteor/session.js";
import ReactAudioPlayer from "react-audio-player";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import _ from "lodash";

import { Sounds } from "../../api/sounds/sounds.js";
import { Images } from "../../api/images/images.js";
import Waveform from "../components/Waveform.jsx";
import AlertLink from "../components/AlertLink.jsx";
import LocalLink from "../components/LocalLink.jsx";
import AppNotification from "../components/AppNotification.jsx";
import BaseComponent from "../components/BaseComponent.jsx";
import CommentList from "../components/CommentList.jsx";
import Input from "../components/Input.jsx";
import ClearingDiv from "../components/ClearingDiv.jsx";
import DragUpload from "../components/DragUpload.jsx";
import SelectUpload from "../components/SelectUpload.jsx";
import TextArea from "../components/TextArea.jsx";
import FileReview from "../components/FileReview.jsx";
import Img from "../components/Image.jsx";
import Message from "../components/Message.jsx";
import Comment from "../components/Comment.jsx";
import { createComment, completeComment } from "../../api/comments/methods.js";

class ReviewTimeMarker extends Component {
    render() {
        const { handleClick, handleOver, handleOut, active, word } = this.props;
        return (
            <span
                className={`time-marker ${active ? " time-marker-active" : ""}`}
                onClick={handleClick}
                onMouseOver={handleOver}
                onMouseOut={handleOut}
            >
                {word}
            </span>
        );
    }
}

class ReviewPage extends BaseComponent {
    constructor(props) {
        super(props);
        this.inRef = React.createRef();
        this.waveRef = React.createRef();
        this.state = {
            activeComment: null,
            currentTime: 0,
            sorter: "created",
            filter: "time",
            invert: false,
            selected: [],
            tags: [],
            bySlide: [],
            byAuth: "",
            byTag: "",
            activeRegion: [],
            image: "",
        };
    }

    handleLoad = () => {
        const grid = document.getElementById("grid");
        const mason = new Masonry(grid, {
            itemSelector: ".file-item",
        });
    };

    handleGenerate = () => {
        const { talk } = this.props;
        console.log("starting generation");
        toast(
            () => (
                <AppNotification
                    msg={"transcript started"}
                    desc={"processing discussion audio..."}
                    icon={"spinner"}
                />
            ),
            {
                autoClose: 8000,
            }
        );

        Meteor.call("mergeSounds", talk._id, console.log);
    };

    handleTranscribe = (file) => {
        const { talk } = this.props;
        console.log("starting transcription");
        console.log(talk._id, file._id);
        Meteor.call("transcribeSounds", talk._id, file._id);
    };

    updateSelected = (event, image) => {
        const { selected } = this.state;
        const newSlide = {
            slideId: image._id,
            slideNo: `${+image.meta.slideNo + 1}`,
        };

        let bySlide;
        const slidesToFilter = (slides) => {
            if (!slides) slides = [];
            return slides.map((s) => s.slideNo.trim());
        };

        if (event.shiftKey || event.metaKey) {
            // adding item to list, or removing item if already in it
            if (selected.some((s) => s.slideId === newSlide.slideId)) {
                const newSelect = selected.filter(
                    (s) => s.slideId !== newSlide.slideId
                );
                bySlide = slidesToFilter(newSelect);
                this.setState({ selected: newSelect, bySlide });
            } else {
                const newSelect = [...selected, newSlide];
                bySlide = slidesToFilter(newSelect);
                this.setState({ selected: newSelect, bySlide });
            }
        } else {
            // set list to just be this item
            bySlide = slidesToFilter([newSlide]);
            this.setState({ selected: [newSlide], bySlide });
        }
    };

    moveSlideUpdate = (inc) => {
        const { images } = this.props;
        const { bySlide, selected } = this.state;
        const first = bySlide.length == 0 ? 1 : +bySlide[0] + inc;
        if (first > images.length || first == 0) return;
        const image = images[first - 1];
        const slide = first.toString();
        const select = { slideNo: slide, slideId: image._id };
        this.setState({ bySlide: [slide], selected: [select] });
        const [item] = document.getElementsByClassName("ds-selected");
        if (item) item.scrollIntoView({ behavior: "smooth" });
    };

    componentDidMount = () => {
        this.handleLoad();
        document.getElementById("__reviewBackground").focus();
    };

    componentDidUpdate = () => {
        this.handleLoad();
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
        const slideId = e.target.dataset.fileId;
        const newSlide = e.target.innerText.trim();
        const selected = [{ slideNo: newSlide, slideId }];
        this.setState({ bySlide: [newSlide], selected });
    };

    clearBySlide = () => {
        this.setState({ selected: [], bySlide: [] });
    };

    // click on tag in comment
    setByTag = (e) => {
        e.preventDefault();
        const { byTag } = this.state;
        const newTag = e.target.innerText.trim();
        if (newTag && byTag == newTag) {
            this.setState({ byTag: "" });
        } else if (newTag) {
            this.setState({ byTag: newTag });
        }
    };

    clearByTag = () => {
        this.setState({ byTag: "" });
    };

    clearReviewer = () => {
        localStorage.setItem("feedbacks.reviewer", null);
        Session.set("reviewer", null);
    };

    clearButtonBG = (e) => {
        //console.log(e.target.className);
        const base = e.target.className.split()[0];
        const matches = [/full-/, /row/, /col-/, /review-table/];
        if (matches.some((x) => base.match(x))) {
            this.clearBySlide();
            this.clearByTag();
            this.clearByAuth();
        }
    };

    clearGrid = (e) => {
        e.preventDefault();
        if (e.target === e.currentTarget) {
            this.clearBySlide();
        }
    };

    renderSlideTags = (selected, done: false) => {
        const { bySlide } = this.state;
        const active = (sn) => (bySlide.includes(sn) ? "active" : "");
        if (selected.length === 0) {
            return null;
        } else {
            const plural = selected.length > 1;
            const slideNos = _.sortBy(selected, (x) => Number(x.slideNo));
            const slideKeys = slideNos.map((s) => (
                <kbd
                    iter={s.slideNo}
                    className={active(s.slideNo)}
                    key={`key-${s.slideNo}`}
                    data-file-id={s.slideId}
                    onClick={this.setBySlide}
                >
                    {s.slideNo}
                </kbd>
            ));
            return (
                <span className="slide-tags">
                    <span>{slideKeys}</span>
                </span>
            );
        }
    };

    renderCommentFilter = () => {
        const filterer = this.renderFilter();
        const searcher = this.renderSearch();
        const { invert, filter } = this.state;
        const invFn = () => this.setState({ invert: !invert });
        const setSort = (s, f, invert) => {
            return () => {
                this.setState({ sorter: s, filter: f, invert });
            };
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
            <div>
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
                        auth
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
                {searcher}
            </div>
        );
    };

    renderSearch = () => {};

    renderImages = () => {
        const { selected } = this.state;
        const { images, comments, regions } = this.props;
        return images.map((f, key) => {
            let link = Images.findOne({ _id: f._id }).link("original", "//");
            let count = [...comments, ...regions].filter((c) => {
                // speed up by not computing this in a loop, precompute and index.
                const general = [{ slideNo: "general" }];
                const slides = c.slides.length > 0 ? c.slides : general;
                const slideNos = slides.map((x) => x.slideNo);
                return slideNos.includes((key + 1).toString());
            }).length;

            const active = selected.some((s) => s.slideId == f._id);
            const setSelect = (e) => this.updateSelected(e, f);
            return (
                <FileReview
                    key={"file-" + key}
                    iter={key + 1}
                    fileUrl={link}
                    fileId={f._id}
                    fileName={f.name}
                    selected={active}
                    slideCount={count}
                    handleClick={setSelect}
                    handleLoad={this.handleLoad}
                />
            );
        });
    };

    renderFilter = () => {
        let { byAuth, bySlide, byTag, selected } = this.state;
        const slideKeys = this.renderSlideTags(selected);
        const sType = bySlide === ["general"] ? "scope" : "slide";
        return (
            <div className="filterer alert no-submit border-bottom">
                <ClearingDiv set={byTag} pre="tag" clear={this.clearByTag} />
                <ClearingDiv
                    set={byAuth}
                    pre="author"
                    clear={this.clearByAuth}
                />
                <ClearingDiv
                    set={slideKeys}
                    pre={sType}
                    clear={this.clearBySlide}
                />
            </div>
        );
    };

    renderGenerate = () => {
        const soundDownload = this.renderSoundDownload();
        return (
            <div>
                <AlertLink
                    handleClick={this.handleGenerate}
                    text={"generate transcript"}
                    center={true}
                />
                {soundDownload}
            </div>
        );
    };

    renderComments = () => {
        const { comments, reviewer, setModal, clearModal } = this.props;
        const { sorter, invert, activeComment, byAuth, bySlide, byTag } =
            this.state;
        if (!comments || !comments.length) {
            return <div className="alert"> no comments yet</div>;
        } else {
            let items = this.generateBaseComments();
            const completed = items.filter((c) => c.completed);
            const incomplete = items.filter((c) => !c.completed);

            return items.length > 0 ? (
                <div>
                    <CommentList title={"comments"} items={incomplete} />
                    <CommentList
                        title={"addressed"}
                        items={completed}
                        defaultOpen={false}
                    />
                </div>
            ) : (
                <div className="alert"> no matching comments</div>
            );
        }
    };

    humanFileSize = (size) => {
        let i = Math.floor(Math.log(1.0 * size) / Math.log(1024));
        return (
            (size / Math.pow(1024, i)).toFixed(2) * 1 +
            " " +
            ["B", "kB", "MB", "GB", "TB"][i]
        );
    };

    humanDate = (msTime) => {
        const ndate = new Date(msTime);
        return ndate.toLocaleString();
    };

    renderContext = () => {
        const fileList = this.renderImages();
        const { talk, name, sound } = this.props;

        return (
            <div className="context-filter">
                <span className="list-title list-title-basic">
                    <LocalLink to={`/talk/${talk._id}`}>
                        <span className="black"> ‹ </span>
                        {name}
                    </LocalLink>
                    {sound && WaveSurfer && (
                        <button
                            className="btn btn-menu pull-right btn-empty"
                            onClick={this.handleExtra}
                        >
                            more
                        </button>
                    )}
                </span>

                <div id="grid-holder">
                    <div className="alert centered no-margin">
                        use <i className="fa fa-arrow-left" /> and{" "}
                        <i className="fa fa-arrow-right" /> to filter by slide
                    </div>
                    <div id="grid" onMouseDown={this.clearGrid}>
                        <div className="v-pad" />
                        {fileList}
                        <div className="v-pad" />
                    </div>
                </div>
            </div>
        );
    };

    renderSoundDownload = () => {
        const { talk, sound } = this.props;
        if (!sound) return;
        const created = this.humanDate(sound.meta.created);
        const size = this.humanFileSize(sound.size);
        const name = `${talk.name}-discussion`;
        const { src } = this.generateSoundData();
        if (!src) return;
        return (
            <a download={name} href={src} className="link-alert">
                <div className="alert">
                    download audio
                    <small className="pull-right">
                        generated: {created} | {size}
                    </small>
                </div>
            </a>
        );
    };

    setDuration = (dur) => {
        this.setState({ duration: dur * 1000.0 });
    };

    setTime = (time) => {
        this.setState({ currentTime: time });
    };

    renderSounds = () => {
        const { activeRegion } = this.state;
        const { src } = this.generateSoundData();
        if (!src) return;
        return (
            <div className="float-at-top">
                <Waveform
                    src={src}
                    ref={this.waveRef}
                    region={activeRegion}
                    handleAudioSet={this.setDuration}
                />
            </div>
        );
    };

    playRegionWord = ({ startTime }) => {
        return () => {
            this.waveRef.current.playTime(startTime);
        };
    };

    highlightRegionWord = (region) => {
        return this.handleRegion(
            {
                startTime: region.startTime,
                endTime: Math.max(region.endTime, region.startTime + 3.0),
                type: "word",
            },
            true
        );
    };

    handleRegion = (region, clear = false) => {
        return _.throttle(() => {
            const wave = this.waveRef.current;
            if (!wave) return false;
            if (clear) wave.clearRegions();
            wave.addRegion(region);
        }, 100);
    };

    playRegionComment = (region) => {
        return () => {
            this.waveRef.current.playTime(region.startTime / 1000.0);
        };
    };

    handleExtra = () => {
        const { setModal, clearModal } = this.props;
        const generate = this.renderGenerate();
        const mContent = <div> {generate} </div>;

        setModal({
            accept: false,
            deny: clearModal,
            denyText: "close",
            mtitle: "More Options",
            mtext: mContent,
            isOpen: true,
        });
    };

    highlightRegionComment = (region) => {
        return this.handleRegion({
            color: "rgba(240, 248, 255, 0.15)",
            startTime: region.startTime / 1000.0,
            endTime: region.stopTime / 1000.0,
            type: "region",
        });
    };

    clearRegions = () => {
        const wave = this.waveRef.current;
        if (!wave) return false;
        wave.clearRegions();
    };

    renderWordList = (words = false) => {
        if (!words) return null;
        return (
            <p>
                {words.map((w, i) => {
                    const playWord = this.playRegionWord(w);
                    const highlight = this.highlightRegionWord(w);
                    return (
                        <ReviewTimeMarker
                            key={`${w.word}-${i}`}
                            handleClick={playWord}
                            handleOver={highlight}
                            handleOut={this.clearRegions}
                            word={w.word}
                        />
                    );
                })}
            </p>
        );
    };

    renderTranscript = () => {
        const { transcript } = this.props;
        if (!transcript) return;
        const { results, confidence } = transcript;
        if (!results || !confidence) return;
        const wordList = this.renderWordList(results);
        const content = (
            <div className="clearfix comment">
                {wordList}
                <hr />
                <p>{(confidence * 100.0).toFixed(1)}% confidence</p>
            </div>
        );

        return (
            <CommentList
                title={"transcript"}
                content={content}
                defaultOpen={true}
            />
        );
    };

    generateSoundData = () => {
        const { activeRegion } = this.state;
        const { sound } = this.props;
        if (!sound || !WaveSurfer) return {};
        const snd = Sounds.findOne({ _id: sound._id });
        if (!snd) return {};
        return {
            src: snd.link("original", "//"),
        };
    };

    generateBaseComments = () => {
        const { comments, reviewer, setModal, clearModal } = this.props;
        const { sorter, invert, activeComment, byAuth, bySlide, byTag } =
            this.state;

        let csort = _.orderBy(
            comments,
            [sorter, "created"],
            [invert ? "desc" : "asc", "asc"]
        );

        // Filtering 'reply' comments into array.
        // TODO - make it so this seperates on punctuation
        const reply = /\[.*\]\(\s?#c(.*?)\)/;
        const isReply = (c) => reply.test(c.content);
        const replies = _.orderBy(
            csort.filter(isReply).map((c) => {
                const match = reply.exec(c.content);
                c.replyTo = match[1].trim();
                c.isReply = true;
                return c;
            }),
            ["created"],
            ["asc"]
        );

        // remove child comments.
        csort = csort.filter((c) => !isReply(c));

        if (byAuth) {
            csort = csort.filter((c) => c.author === byAuth);
        }

        if (bySlide.length > 0) {
            csort = csort.filter((c) => {
                const general = [{ slideNo: "general" }];
                const slides = c.slides.length > 0 ? c.slides : general;
                const slideNos = slides.map((x) => x.slideNo);
                return bySlide.some((sn) => slideNos.includes(sn));
            });
        }

        if (byTag) {
            csort = csort.filter((c) => c.content.includes(byTag));
        }

        const items = csort.map((c, i) => {
            c.transcript = c.author === "transcript";
            c.active = c._id === activeComment; // highlight
            c.replies = replies.filter((r) => r.replyTo == c._id);
            const context = this.renderSlideTags(c.slides, true);
            return {
                ...c,
                key: c._id,
                reviewView: true,
                context,
                reviewer,
                setModal,
                clearModal,
                log: this.log,
                allReplies: replies,
                commentRef: this.inRef,
                setBySlide: this.setBySlide,
                handleTag: this.setByTag,
                handleAuthor: this.setByAuth,
                setActive: this.setActiveComment,
                unsetActive: this.clearActiveComment,
            };
        });

        return items;
    };

    generateWordList = (region, pad = 200) => {
        const { startTime, stopTime } = region;
        const { transcript } = this.props;
        if (!transcript) return;
        const { results, confidence } = transcript;
        if (!results || !confidence) return;
        return results.filter((word) => {
            return (
                word.startTime > (startTime - pad) / 1000 &&
                word.endTime < (stopTime + pad) / 1000
            );
        });
    };

    renderRegions = () => {
        const { duration, sorter, invert, byAuth, bySlide, byTag } = this.state;
        const { talk, regions } = this.props;
        if (!regions || !duration) return;
        if (!this.waveRef || !this.waveRef.current) return;
        const wave = this.waveRef.current;

        let filtered = regions
            .filter((w) => w.startTime < duration && w.stopTime > 0)
            .map((w) => {
                w.created = w.startTime;
                return w;
            });

        let rsort = _.orderBy(
            filtered,
            [sorter, "startTime"],
            [invert ? "desc" : "asc", "asc"]
        );

        if (byAuth) {
            rsort = rsort.filter((c) => c.author === byAuth);
        }

        if (bySlide.length > 0) {
            rsort = rsort.filter((c) => {
                const general = [{ slideNo: "general" }];
                const slides = c.slides.length > 0 ? c.slides : general;
                const slideNos = slides.map((x) => x.slideNo);
                return bySlide.some((sn) => slideNos.includes(sn));
            });
        }

        if (byTag) {
            rsort = rsort.filter((c) => c.content.includes(byTag));
        }

        const regionComments = rsort.map((w, i) => {
            const playComment = this.playRegionComment(w);
            const highlight = this.highlightRegionComment(w);
            const words = this.generateWordList(w);
            const commentWords = this.renderWordList(words);
            //console.log(words, commentWords);
            return {
                ...w,
                last: i + 1 == regions.length,
                handlePlayAudio: playComment,
                handleMouseOut: this.clearRegions,
                handleMouseOver: highlight,
                wordList: commentWords,
                regionView: true,
                commentRef: this.inRef,
                setBySlide: this.setBySlide,
                handleTag: this.setByTag,
                handleAuthor: this.setByAuth,
            };
        });

        return (
            <CommentList
                title={"discussion"}
                items={regionComments}
                defaultOpen={true}
            />
        );
    };

    handleKeyDown = (event) => {
        switch (event.keyCode) {
            case 32:
                //console.log('space key pressed');
                event.preventDefault();
                event.stopPropagation();
                this.waveRef.current.playAudio();
                return;
                break;
            case 37:
            case 38:
                //console.log('Left key pressed');
                event.preventDefault();
                event.stopPropagation();
                this.moveSlideUpdate(-1);
                break;
            case 39:
            case 40:
                //console.log('Right key pressed');
                event.preventDefault();
                event.stopPropagation();
                this.moveSlideUpdate(+1);
                break;
        }
    };

    render() {
        const { sound } = this.props;
        const trans = this.renderTranscript();
        const regions = this.renderRegions();
        const comments = this.renderComments();
        const context = this.renderContext();
        const filter = this.renderCommentFilter();
        const generate = this.renderGenerate();
        const audio = this.renderSounds();

        return (
            this.renderRedirect() || (
                <div
                    tabIndex="0"
                    className="full-container padded reviewPage"
                    id="__reviewBackground"
                    onMouseDown={this.clearButtonBG}
                    onKeyDown={this.handleKeyDown}
                    onKeyPress={this.handleKeyDown}
                >
                    {sound && audio}
                    <div id="review-view" className="table review-table">
                        <div className="row">
                            <div className="col-sm-5">
                                {context}
                                {!sound && generate}
                                {trans}
                            </div>
                            <div className="col-sm-7">
                                {filter}
                                {regions}
                                {comments}
                            </div>
                        </div>
                    </div>
                </div>
            )
        );
    }
}

export default ReviewPage;
