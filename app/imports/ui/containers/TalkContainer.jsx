/* eslint max-len 0 */
import React from "react";
import PropTypes from "prop-types";
import { Session } from "meteor/session.js";
import BaseComponent from "../components/BaseComponent.jsx";
import ReviewContainer from "../containers/ReviewContainer.jsx";
import _ from "lodash";

export default class TalkContainer extends BaseComponent {
    renewSubscription = (_id) => {
        const sub = Session.get("subscription");
        return _id && (!sub || sub.type != "talk" || sub._id != _id);
    };

    oldControlFilter = (comment) => {
        const auth = ["system", this.props.reviewer];
        return (
            !comment.userOwn ||
            (comment.userOwn && auth.includes(comment.author))
        );
    };

    controlFilter = (comment) => {
        return comment.author !== "transcript";
    };

    getTalkProps = (_id) => {
        if (this.renewSubscription(_id)) {
            Session.set("subscription", { type: "talk", _id });
        }

        const toRegion = (comment) => {
            if (!comment.regions) {
                return;
            } else {
                return comment.regions.map((r) => {
                    return {
                        ...comment,
                        ...r,
                    };
                });
            }
        };

        const nullF = (region) => {
            return region != null;
        };

        const {
            talks,
            reviewer,
            files,
            images,
            sounds,
            comments,
            transcripts,
        } = this.props;

        let props = {};
        props.talk = talks.find((t) => t._id === _id) || {};
        props.file = files.find((f) => f.meta.talkId === _id);
        props.comments = comments.filter((c) => c.talk === _id);
        props.comments = props.comments.filter(this.controlFilter);
        props.transcript = transcripts.find((t) => t.talk === _id);
        props.images = images.filter((f) => f.meta.talkId === _id);
        props.sound = sounds.find(
            (f) => f.meta.talkId === _id && f.meta.complete
        ); // merged audio.
        props.sessionOwner = props.talk.userId === Meteor.userId();
        props.name = props.talk.name;
        props.reviewer = reviewer;

        // trimming extra props
        delete props.transcripts;

        // compute comment regions.
        props.regions = _.flatten(props.comments.map(toRegion)).filter(nullF);
        return props;
    };

    render() {
        const { id, Comp } = this.props;
        const talkProps = this.getTalkProps(id);
        return (
            this.renderRedirect() || (
                <ReviewContainer Comp={Comp} {...this.props} {...talkProps} />
            )
        );
    }
}

TalkContainer.propTypes = {
    id: PropTypes.string.isRequired,
};
