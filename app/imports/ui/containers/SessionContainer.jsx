import React from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session.js";
import BaseComponent from "../components/BaseComponent.jsx";

export default class SessionContainer extends BaseComponent {
    renewSubscription = (_id) => {
        const sub = Session.get("subscription");
        return _id && (!sub || sub.type != "session" || sub._id != _id);
    };

    getSessionProps = (_id) => {
        if (this.renewSubscription(_id)) {
            Session.set("subscription", { type: "session", _id });
        }

        let props = {};
        const { sessions, talks, files, images, comments } = this.props;
        const session = sessions.find((s) => s._id === _id) || { talks: [] };

        props.talks = session.talks.map((tId, i) => {
            let t = talks.find((t) => t._id === tId) || {
                _id: i,
                comments: [],
            };
            t.comments = comments.filter((c) => c.talk === tId) || [];
            t.talkId = tId;
            return t;
        });

        props.files = files.filter((f) => f.meta.sessionId === _id);
        props.images = images.filter((f) => f.meta.sessionId === _id);
        props.sessionOwner = Meteor.userId() === session.userId;
        props.name = session.name;
        props.session = session;
        props.sessionId = _id;
        return props;
    };

    render() {
        const { id, Comp, ...other } = this.props;
        let sessionProps = this.getSessionProps(id);
        return this.renderRedirect() || <Comp {...other} {...sessionProps} />;
    }
}

SessionContainer.propTypes = {
    id: PropTypes.string.isRequired,
};
