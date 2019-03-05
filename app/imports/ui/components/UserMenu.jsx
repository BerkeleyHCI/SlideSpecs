import React from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { Link } from "react-router-dom";
import BaseComponent from "./BaseComponent.jsx";
import { Session } from "meteor/session.js";

export default class UserMenu extends BaseComponent {
  goHome = e => {
    e.preventDefault();
    this.redirectTo("/");
  };

  logout = e => {
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
        <a className="btn-secondary" onClick={this.goHome}>
          {username}
        </a>
        <a className="btn-secondary" onClick={this.logout}>
          log out
        </a>
      </div>
    );
  };

  // <Link to="/guide" className="btn-secondary">
  //   guide
  // </Link>

  renderLoggedOut() {
    return (
      <div className="user-menu">
        <Link to="/signin" className="btn-secondary">
          login
        </Link>
        <Link to="/join" className="btn-secondary">
          join
        </Link>
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
            <Link to="/">SlideSpecs</Link>
          </h1>
          {content}
        </section>
      )
    );
  }
}

UserMenu.propTypes = {
  user: PropTypes.object
};
