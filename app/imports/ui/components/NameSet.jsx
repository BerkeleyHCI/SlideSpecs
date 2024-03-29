import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session.js";
import Input from "./Input.jsx";

class NameSet extends Component {
    constructor(props) {
        super(props);
        this.inRef = React.createRef();
    }

    componentDidMount = () => {
        const saved = localStorage.getItem("feedbacks.reviewer");
        const mu = Meteor.user();
        let username;
        if (mu) {
            username = mu.username;
        }

        if (username && saved !== username) {
            localStorage.setItem("feedbacks.reviewer", username);
            Session.set("reviewer", username);
        } else if (saved && saved != "null") {
            Session.set("reviewer", saved);
        }
    };

    setName = () => {
        const name = this.inRef.current.value;
        localStorage.setItem("feedbacks.reviewer", name);
        Session.set("reviewer", name);
    };

    render() {
        return (
            <div className="padded">
                <div className="padded">
                    <h1>Name Entry</h1>
                    Please enter your name before providing feedback:
                    <hr />
                    <Input
                        inRef={this.inRef}
                        handleSubmit={this.setName}
                        defaultValue="your name"
                        className="padded"
                    />
                    <hr />
                    <div className="btns-group">
                        <button
                            onClick={this.setName}
                            className="btn btn-primary"
                        >
                            set name
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

export default NameSet;
