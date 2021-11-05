import React from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { Link } from "react-router-dom";
import BaseComponent from "./BaseComponent.jsx";
import { Session } from "meteor/session.js";
import LocalLink from "../components/LocalLink.jsx";

export default class UserMenu extends BaseComponent {
    logout = (e) => {
        e.preventDefault();
        Meteor.logout(() => {
            localStorage.setItem("feedbacks.referringLink", "");
            Session.set("reviewer", null);
            Session.set("session", null);
            Session.set("talk", null);
        });
    };

    renderOpen = () => {
        const { user } = this.props;
        const username = user.username;
        return (
            <div className="user-menu">
                <LocalLink className="btn-secondary" to={"/"}>
                    {username}
                </LocalLink>
                <span className="btn-secondary" onClick={this.logout}>
                    log out
                </span>
            </div>
        );
    };

    renderLoggedOut() {
        return (
            <div className="user-menu">
                <LocalLink to="/signin" className="btn-secondary">
                    signin
                </LocalLink>
                <LocalLink to="/join" className="btn-secondary">
                    join
                </LocalLink>
                <LocalLink to="/guide" className="btn-secondary">
                    guide
                </LocalLink>
            </div>
        );
    }

    render() {
        const { user } = this.props;
        let content = user ? this.renderOpen() : this.renderLoggedOut();
        return (
            this.renderRedirect() || (
                <section className="clearfix" id="menu">
                    <h1>
                        <LocalLink to="/">SlideSpecs</LocalLink>
                    </h1>
                    {content}
                </section>
            )
        );
    }
}

UserMenu.propTypes = {
    user: PropTypes.object,
};
