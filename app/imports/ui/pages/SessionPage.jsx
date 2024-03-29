import React from "react";
import { Meteor } from "meteor/meteor";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

import AlertLink from "../components/AlertLink.jsx";
import DragUpload from "../components/DragUpload.jsx";
import SelectUpload from "../components/SelectUpload.jsx";
import TalkListItem from "../components/TalkListItem.jsx";
import BaseComponent from "../components/BaseComponent.jsx";
import MenuContainer from "../containers/MenuContainer.jsx";
import AppNotification from "../components/AppNotification.jsx";
import { Files } from "../../api/files/files.js";
import { deleteSessionFiles } from "../../api/files/methods.js";
import { createTalk, setTalkProgress } from "../../api/talks/methods.js";

export default class SessionPage extends BaseComponent {
    deleteFiles = () => {
        const { sessionId } = this.props;
        if (confirm("Delete ALL talks for this session?"))
            deleteSessionFiles.call({ sessionId });
    };

    handleDropUpload = (files) => {
        this.handleUpload(files);
    };

    handleSelectUpload = (e) => {
        e.preventDefault();
        const files = [...e.currentTarget.files];
        this.handleUpload(files);
    };

    handleUpload = (files) => {
        let { sessionId, fileLocator } = this.props;
        const handleToast = ({ msg, desc, icon, closeTime }) => {
            if (!closeTime) closeTime = 4000;
            toast(() => <AppNotification msg={msg} desc={desc} icon={icon} />, {
                autoClose: closeTime,
            });
        };

        if (files) {
            files.map((file) => {
                // Allow uploading files under 30MB for now.
                const goodType = /(pdf)$/i.test(file.name);
                const goodSize = file.size <= 30985760;
                // const goodType = /(pdf|ppt|pptx|key)$/i.test(file.name);
                if (!goodSize || !goodType) {
                    handleToast({
                        msg: "error",
                        icon: "times",
                        desc: "Please only upload pdf/ppt/pptx, with size equal or less than 30MB.",
                        // "Please only upload pdf files, with size equal or less than 30MB.",
                    });
                    return; // skip this file.
                }

                const talkId = createTalk.call({
                    sessionId: sessionId,
                    name: file.name,
                });

                let uploadInstance = Files.insert(
                    {
                        file,
                        meta: {
                            locator: fileLocator,
                            userId: Meteor.userId(),
                            sessionId,
                            talkId,
                        },
                        //transport: 'http',
                        streams: "dynamic",
                        chunkSize: "dynamic",
                        allowWebWorkers: true,
                    },
                    false // dont autostart the upload.
                );

                uploadInstance.on("start", (err, file) => {
                    console.log("started", file.name);
                });

                uploadInstance.on("progress", function (progress) {
                    setTalkProgress.call({ talkId, progress });
                });

                uploadInstance.on("uploaded", (err, file) => {
                    console.log("uploaded", file.name);
                    setTalkProgress.call({ talkId, progress: 100 });
                });

                uploadInstance.on("end", (err, file) => {
                    console.log("file:", file);
                    handleToast({
                        msg: file.name,
                        icon: "check",
                        desc: "upload complete",
                    });
                });

                uploadInstance.on("error", (err, file) => {
                    if (err) console.error(err, file);
                    handleToast({
                        msg: file.name,
                        icon: "times",
                        desc: `Error uploading: ${err}`,
                    });
                });

                uploadInstance.start();
            });
        }
    };

    render() {
        const { session, name, talks, files, images, comments } = this.props;
        const shareLink = window.location.origin + "/share/" + session._id;

        // TODO update this into the secret session field instead of rthe regular // id
        const uploadLink = window.location.origin + "/upload/" + session._id;

        const content = (
            <div className="main-content">
                <h1>{name}</h1>

                <AlertLink
                    text={"Share this session with a public link"}
                    bText={"open link"}
                    link={shareLink}
                />

                <AlertLink
                    text={"Let presenters add their own slides"}
                    bText={"open link"}
                    link={uploadLink}
                />

                {talks.length > 0 && (
                    <div>
                        <ul className="v-pad list-group">
                            {talks.map((talk, i) => (
                                <TalkListItem
                                    iter={i}
                                    key={talk._id}
                                    talkId={talk._id}
                                    talk={talk}
                                    images={images}
                                    comments={comments}
                                    files={files}
                                    linkPre="slides"
                                    ordering={true}
                                    sessionOwner={this.props.sessionOwner}
                                />
                            ))}
                        </ul>
                    </div>
                )}

                <div className="alert">
                    Add {talks.length > 0 && " more "} presentations here.
                    <SelectUpload
                        labelText="+ new"
                        className="pull-right btn-menu btn-primary"
                        handleUpload={this.handleSelectUpload}
                    />
                    <hr />
                    <DragUpload handleUpload={this.handleDropUpload} />
                    {talks.length > 0 && (
                        <div className="btns-group">
                            <button
                                onClick={this.deleteFiles}
                                className="btn btn-danger"
                            >
                                delete all
                            </button>
                        </div>
                    )}
                </div>

                <h3>
                    <span className="black"> ‹ </span>
                    <Link to={`/`}>back</Link>
                </h3>
            </div>
        );

        return <MenuContainer {...this.props} content={content} />;
    }
}

SessionPage.propTypes = {
    user: PropTypes.object,
    sessionId: PropTypes.string,
    talks: PropTypes.array,
    files: PropTypes.array,
};

SessionPage.defaultProps = {
    user: null,
    talks: [],
    files: [],
};
