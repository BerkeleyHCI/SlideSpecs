import React from "react";
import { Meteor } from "meteor/meteor";
import { Link } from "react-router-dom";
import { Accounts } from "meteor/accounts-base";

import BaseComponent from "../components/BaseComponent.jsx";
import AuthPage from "./AuthPage.jsx";

class SignUpPage extends BaseComponent {
    constructor(props) {
        super(props);
        document.title = "SlideSpecs — Sign Up";
        this.state = { errors: {} };
    }

    redirectHomeIfUser = () => {
        const saved = localStorage.getItem("feedbacks.referringLink");
        const home = saved || "/";
        if (Meteor.user() && !Meteor.loggingIn()) {
            this.redirectTo(home);
        }
    };

    componentDidMount = this.redirectHomeIfUser;
    componentDidUpdate = this.redirectHomeIfUser;

    onSubmit = (event) => {
        event.preventDefault();
        const username = this.username.value;
        const password = this.password.value;
        const confirm = this.confirm.value;
        const errors = {};

        if (!password) {
            errors.password = "password required";
        }
        if (confirm !== password) {
            errors.confirm = "wrong password confirmation";
        }

        this.setState({ errors });
        if (Object.keys(errors).length) {
            return;
        }

        Accounts.createUser(
            {
                username: username,
                password,
            },
            (err) => {
                if (err) {
                    this.setState({ errors: { none: err.reason } });
                }
            }
        );
    };

    render() {
        const { errors } = this.state || {};
        const errorMessages = Object.keys(errors).map((key) => errors[key]);
        const errorClass = (key) => errors[key] && "error";

        const content = (
            <div className="wrapper-auth">
                <h1 className="title-auth">sign up</h1>
                <form onSubmit={this.onSubmit}>
                    <div className="list-errors">
                        {errorMessages.map((msg) => (
                            <div className="list-item" key={msg}>
                                {msg}
                            </div>
                        ))}
                    </div>
                    <div className={`input-symbol ${errorClass("username")}`}>
                        <i className="fa fa-inline fa-user" title="username" />
                        <input
                            type="username"
                            name="username"
                            ref={(c) => {
                                this.username = c;
                            }}
                            placeholder="username"
                        />
                    </div>
                    <div className={`input-symbol ${errorClass("password")}`}>
                        <i className="fa fa-inline fa-key" title="password" />
                        <input
                            type="password"
                            name="password"
                            ref={(c) => {
                                this.password = c;
                            }}
                            placeholder="password"
                        />
                    </div>
                    <div className={`input-symbol ${errorClass("confirm")}`}>
                        <i className="fa fa-inline fa-key" title="password" />
                        <input
                            type="password"
                            name="confirm"
                            ref={(c) => {
                                this.confirm = c;
                            }}
                            placeholder="confirm password"
                        />
                    </div>
                    <button type="submit" className="btn-primary">
                        sign up now
                    </button>
                </form>
            </div>
        );

        const link = (
            <Link to="/login" className="link-auth-alt">
                login
            </Link>
        );

        return (
            this.renderRedirect() || (
                <AuthPage {...this.props} content={content} link={link} />
            )
        );
    }
}

export default SignUpPage;
