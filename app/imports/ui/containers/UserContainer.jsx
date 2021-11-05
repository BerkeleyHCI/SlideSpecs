import React from "react";
import PropTypes from "prop-types";
import { Session } from "meteor/session.js";
import BaseComponent from "../components/BaseComponent.jsx";

export default class UserContainer extends BaseComponent {
    renewSubscription = (_id) => {
        const sub = Session.get("subscription");
        return _id && (!sub || sub.type != "user" || sub._id != _id);
    };

    getUserProps = (_id) => {
        if (this.renewSubscription(_id)) {
            Session.set("subscription", { type: "user", _id });
        }

        let props = {};
        const { sessions, talks, files, images, comments } = this.props;
        props.sessions = sessions.filter((s) => s.userId === _id);
        props.talks = talks.filter((f) => f.userId === _id);
        props.comments = comments.filter((f) => f.userId === _id);
        props.files = files.filter((f) => f.meta.userId === _id);
        props.images = images.filter((f) => f.meta.userId === _id);
        return props;
    };

    render() {
        const { id, Comp, ...other } = this.props;
        let userProps = this.getUserProps(id);
        return this.renderRedirect() || <Comp {...other} {...userProps} />;
    }
}

UserContainer.propTypes = {
    id: PropTypes.string.isRequired,
};
