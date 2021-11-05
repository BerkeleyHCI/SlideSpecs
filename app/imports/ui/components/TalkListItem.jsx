import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { Link } from "react-router-dom";
import LocalLink from "./LocalLink"
import {
    renameTalk,
    deleteTalk,
    moveSessionTalk,
} from "../../api/talks/methods.js";
import { Images } from "../../api/images/images.js";
import Img from "../components/Image.jsx";

class TalkListItem extends Component {
    renameTalk = () => {
        const { talk } = this.props;
        let validName = /[^a-zA-Z0-9 .:+()\-_%!&]/gi;
        let prompt = window.prompt("New talk name?", talk.name);
        if (prompt) {
            prompt = prompt.replace(validName, "-");
            prompt.trim();
        }

        if (!_.isEmpty(prompt)) {
            renameTalk.call({ talkId: talk._id, newName: prompt });
        }
    };

    moveTalkUp = () => {
        const { iter, talk } = this.props;
        moveSessionTalk.call({ talkId: talk._id, position: iter - 1 });
    };

    moveTalkDown = () => {
        const { iter, talk } = this.props;
        moveSessionTalk.call({ talkId: talk._id, position: iter + 1 });
    };

    deleteTalk = () => {
        const { talk } = this.props;
        deleteTalk.call({ talkId: talk._id });
    };

    renderOrdering = () => {
        return (
            <div className="move-tag btns-empty">
                <button
                    onClick={this.moveTalkUp}
                    className="btn-empty btn-menu"
                >
                    <i className="fa fa-angle-up upper-left" />
                </button>
                <button
                    onClick={this.moveTalkDown}
                    className="btn-empty btn-menu"
                >
                    <i className="fa fa-angle-down lower-left" />
                </button>
            </div>
        );
    };

    render() {
        const { talk, ordering, linkPre, images, sessionOwner } = this.props;
        const orderControls = this.renderOrdering();
        const talkLink = `/${linkPre}/${talk._id}`;
        let iLink = "/loading.svg";

        const tImages = images.filter((i) => i.meta.talkId === talk._id);
        const hasImages = tImages && tImages.length > 0;
        if (hasImages) {
            try {
                let testImage;
                const image = _.sortBy(tImages, (x) =>
                    Number(x.meta.slideNo)
                )[0];
                if (image) testImage = Images.findOne(image._id);
                if (testImage) iLink = testImage.link("original", "//");
            } catch (e) {
                console.error(e);
            }
        }

        const timedOutState = <span>generating slide images</span>;
        const timedOut = !hasImages && Date.now() - talk.created > 180 * 1000; // 3 minutes
        if (timedOut) iLink = "/x.svg";

        const uploading = (!timedOut && !talk.progress) || talk.progress < 100;
        const uploadState = <span>uploading: {talk.progress}%</span>;

        // const comments = talk.comments ? talk.comments.length : 0;
        // const hasComments = comments > 1;

        return (
            <li className="list-group-item clearfix">
                <div className="table no-margin">
                    <div className="row row-eq-height equal">
                        <div className="col-sm-3">
                            {!linkPre && (
                                <Img className="preview" source={iLink} />
                            )}
                            {linkPre && (
                                <Link to={talkLink}>
                                    <Img className="preview" source={iLink} />
                                </Link>
                            )}
                        </div>

                        <div className="col-sm-9 padded">
                            {ordering && orderControls}
                            {sessionOwner && (
                                <div className="btn-m-group pull-right">
                                    <button
                                        onClick={this.renameTalk}
                                        className="btn-menu"
                                    >
                                        rename
                                    </button>
                                    <button
                                        onClick={this.deleteTalk}
                                        className="btn-menu"
                                    >
                                        delete
                                    </button>
                                </div>
                            )}
                            {!linkPre && talk.name}
                            {linkPre && (
                                <LocalLink to={talkLink}>{talk.name}</LocalLink>
                            )}
                            {!hasImages && (
                                <i>
                                    <br />
                                    <br />
                                    {uploading && !timedOut && uploadState}
                                    {!uploading && !timedOut && timedOutState}
                                    {timedOut && (
                                        <span>
                                            processing error - please reupload
                                        </span>
                                    )}
                                </i>
                            )}
                        </div>
                    </div>
                </div>
            </li>
        );
    }
}

// todo: add comment and slide notes as a tag overlay
//{hasComments && ( <i> <br /> {comments} comments </i>)}

TalkListItem.propTypes = {
    talk: PropTypes.object,
    images: PropTypes.array,
    linkPre: PropTypes.string,
    sessionOwner: PropTypes.bool,
    ordering: PropTypes.bool,
};

TalkListItem.defaultProps = {
    talk: { name: "", comments: [] },
    iter: 0,
    images: [],
    linkPre: "",
    sessionOwner: false,
    ordering: false,
};

export default TalkListItem;
