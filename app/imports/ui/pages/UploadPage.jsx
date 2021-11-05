import React from "react";
import { Meteor } from "meteor/meteor";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

import BaseComponent from "../components/BaseComponent.jsx";
import MenuContainer from "../containers/MenuContainer.jsx";
import AppNotification from "../components/AppNotification.jsx";
import { Files } from "../../api/files/files.js";
import DragUpload from "../components/DragUpload.jsx";
import AlertLink from "../components/AlertLink.jsx";
import SelectUpload from "../components/SelectUpload.jsx";
import TalkListItem from "../components/TalkListItem.jsx";
import { deleteTalkFile } from "../../api/files/methods.js";
import { createTalk, setTalkProgress } from "../../api/talks/methods.js";

/*
 * This page is for the presenters to add their own slides, rather than
 * the default session manager slide which can upload multiple slides at one
 * time.
 *
 */

export default class UploadPage extends BaseComponent {
    deleteTalkFile = () => {
        const { talk } = this.props;
        if (confirm("Delete the uploaded file for your talk?"))
            deleteTalkFile.call({ talkId: talk._id });
    };

    handleDropUpload = (files) => {
        this.handleUpload(files);
    };

    handleSelectUpload = (e) => {
        e.preventDefault();
        const files = [...e.currentTarget.files];
        this.handleUpload(files);
    };

    handleUpload = (allfiles) => {
        let { sessionId, fileLocator } = this.props;
        // Only allow for uploading one file per talk.
        const file = allfiles[0];
        if (!file) {
            return false;
        }

        const handleToast = ({ msg, desc, icon, closeTime }) => {
            if (!closeTime) closeTime = 4000;
            toast(() => <AppNotification msg={msg} desc={desc} icon={icon} />, {
                autoClose: closeTime,
            });
        };

        // Allow uploading files under 30MB for now.
        const goodSize = file.size <= 30985760;
        //const goodType = /(pdf|ppt|pptx|key)$/i.test(file.name);
        const goodType = /(pdf)$/i.test(file.name);
        if (!goodSize || !goodType) {
            handleToast({
                msg: "error",
                icon: "times",
                desc: "Please only upload pdf files, with size equal or less than 30MB.",
            });
            return; // skip this file.
        }

        const talkId = createTalk.call({
            sessionId,
            name: file.name.replace(/\.[^/.]+$/, ""),
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
                streams: "dynamic",
                chunkSize: "dynamic",
                allowWebWorkers: true,
            },
            false
        );

        const toastDone = (
            <AppNotification
                msg="success"
                desc="upload complete"
                icon="check"
            />
        );

        uploadInstance.on("progress", function (progress, file) {
            setTalkProgress.call({ talkId, progress });
        });

        uploadInstance.on("uploaded", (err, file) => {
            console.log("uploaded", file.name);
            setTalkProgress.call({ talkId, progress: 100 });
        });

        uploadInstance.on("end", function (error, fileObj) {
            toast(() => toastDone, { autoClose: 2000 });
        });

        uploadInstance.on("error", function (error, fileObj) {
            console.error(`Error during upload.`, error);
        });

        uploadInstance.start();
    };

    render() {
        const { session, name, talk, files, images, sessionOwner } = this.props;
        const shareLink = window.location.origin + "/share/" + session._id;

        let content = (
            <div className="main-content">
                <h1>{name}</h1>
                {sessionOwner && (
                    <div className="alert">
                        <small className="pull-right">
                            <i>
                                You own this session; only you see this message.
                            </i>
                        </small>
                        Share this link to let speakers upload their own slides.
                        <hr />
                        <code>{window.location.href}</code>
                        <hr />
                        <Link to={`/sessions/${session._id}`}>
                            <span className="black"> ‹ </span>
                            Go back to the session management panel.
                        </Link>
                    </div>
                )}

                <h3>speaker slide management</h3>

                {talk && (
                    <div>
                        <div>
                            <ul className="v-pad list-group">
                                <TalkListItem
                                    key={talk._id}
                                    talk={talk}
                                    images={images}
                                    files={files}
                                    linkPre="slides"
                                    sessionOwner={true}
                                />
                            </ul>
                        </div>
                        <AlertLink
                            text={"view all talks for this session"}
                            bText={"open link"}
                            link={shareLink}
                        />
                    </div>
                )}

                {!talk && (
                    <div className="alert">
                        add your presentation here.
                        <SelectUpload
                            labelText="+ new"
                            className="pull-right btn-menu btn-primary"
                            handleUpload={this.handleSelectUpload}
                        />
                        <hr />
                        <DragUpload handleUpload={this.handleDropUpload} />
                    </div>
                )}
            </div>
        );

        return <MenuContainer {...this.props} content={content} />;
    }
}

UploadPage.propTypes = {
    user: PropTypes.object.isRequired,
    sessionId: PropTypes.string,
    files: PropTypes.array,
    talk: PropTypes.object,
};

UploadPage.defaultProps = {
    user: null,
    files: [],
};
