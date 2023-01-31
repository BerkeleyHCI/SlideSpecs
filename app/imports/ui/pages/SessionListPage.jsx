import React from "react";
import PropTypes from "prop-types";
import BaseComponent from "../components/BaseComponent.jsx";
import MenuContainer from "../containers/MenuContainer.jsx";
import { Link } from "react-router-dom";
import _ from "lodash";
import {
    createSession,
    renameSession,
    deleteSession,
} from "../../api/sessions/methods.js";

// Helper class for individual file items.

class SessionItem extends BaseComponent {
    renameSession = (e) => {
        e.stopPropagation();
        const { _id, name } = this.props;
        let validName = /[^a-zA-Z0-9 .:+()\-_%!&]/gi;
        let prompt = window.prompt("New session name?", name);

        if (prompt) {
            prompt = prompt.replace(validName, "-");
            prompt.trim();
        }

        if (!_.isEmpty(prompt)) {
            renameSession.call({ sessionId: _id, newName: prompt });
        }
    };

    confirmDeleteSession = () => {
        const { setModal, clearModal, name } = this.props;
        setModal({
            accept: this.deleteSession,
            deny: clearModal,
            mtitle: "Delete this session?",
            mtext: name,
            act: "delete",
            isOpen: true,
        });
    };

    deleteSession = () => {
        const { clearModal } = this.props;
        deleteSession.call({ sessionId: this.props._id });
        clearModal();
    };

    render() {
        const { _id, name } = this.props;
        const sessLink = `/sessions/${_id}`;
        return (
            <li className="list-group-item clearfix">
                <Link to={sessLink}>{name}</Link>
                <div className="btn-m-group pull-right">
                    <button onClick={this.renameSession} className="btn-menu">
                        rename
                    </button>
                    <button
                        onClick={this.confirmDeleteSession}
                        className="btn-menu btn-danger"
                    >
                        delete
                    </button>
                </div>
            </li>
        );
    }
}

class TalkItem extends BaseComponent {
    render() {
        const { session, name } = this.props;
        const talkLink = `/upload/${session}`;
        return (
            <li className="list-group-item clearfix">
                <Link to={talkLink}>{name}</Link>
            </li>
        );
    }
}

export default class SessionListPage extends BaseComponent {
    addSession = () => {
        createSession.call({}, (err, res) => {
            if (err) {
                console.error(err);
            } else {
                this.redirectTo(`/sessions/${res}`);
            }
        });
    };

    // Return talks for this user where they dont own the session
    talkFilter = (t) => {
        const { user, sessions } = this.props;
        const id = user._id;
        if (!t.session || t.userId !== id) return false;
        const tSession = sessions.find((s) => s.talks.includes(t._id));
        return !tSession;
    };

    render() {
        const { sessions, talks, setModal, clearModal } = this.props;
        const modal = { setModal, clearModal };

        let Sessions;
        if (!sessions || !sessions.length) {
            Sessions = <div className="alert">no sessions yet</div>;
        } else {
            Sessions = sessions.map((sess) => (
                <SessionItem key={sess._id} {...sess} {...modal} />
            ));
        }

        let Talks;
        if (!talks || !talks.length) {
            Talks = <div></div>;
        } else {
            Talks = talks
                .filter(this.talkFilter)
                .map((t) => <TalkItem key={t._id} {...t} />);
        }

        const content = (
            <div className="main-content">
                <h1>Sessions</h1>
                <Link to={"/guide"} className="btn btn-empty pull-right">
                    user guide
                </Link>
                <button onClick={this.addSession} className="btn btn-primary">
                    + new session
                </button>
                <ul className="v-pad list-group">{Sessions}</ul>

                {Talks.length > 0 && <h1>Talks</h1>}
                <ul className="v-pad list-group">{Talks}</ul>
            </div>
        );

        return (
            this.renderRedirect() || (
                <MenuContainer {...this.props} content={content} />
            )
        );
    }
}

SessionListPage.propTypes = { sessions: PropTypes.array };
