import React, { Component } from "react";
import AlertLink from "../components/AlertLink.jsx";
import BaseComponent from "../components/BaseComponent.jsx";
import {Link} from 'react-router-dom';
import MenuContainer from '../containers/MenuContainer.jsx';

//<img className="gif" src="guide/jw_facilitate.gif" />
//<img className="gif" src="guide/jw_transcription.gif" />
//<VideoLink video={'hrCHEy5k_rU'} />
//<VideoLink video={'mHI9E5xycc4'} />

class VideoLink extends Component {
    render() {
        const { video } = this.props;
        return (
            <div className="embed-container">
                <iframe
                    width="560"
                    height="315"
                    src={`https://www.youtube.com/embed/${video}?rel=0&autohide=2`}
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                />
            </div>
        );
    }
}

class GuidePage extends BaseComponent {
    render() {
        const { user } = this.props;
        const content = (
            <div className="main-content" id="guide-container">
                <h3 className="pull-right">
                    <Link to={`/`}>
                        <span className="black"> ‹ </span> back
                    </Link>
                </h3>
                <h1>User Guide</h1>
                <div className="alert">
                    for:
                    <a href="#presenters"> presenters</a> |{" "}
                    <a href="#audience">audience members</a> |{" "}
                    <a href="#managers">session owners</a>
                </div>

                <h2 id="presenters">For Presenters</h2>
                <div className="alert">
                    <h3>Upload slides</h3>
                    <img
                        className="gif"
                        src="guide/join_add_presenter_slides.gif"
                    />
                    Create an account or log in. Drag and drop a PDF of your
                    presentation.
                </div>

                <h2 id="audience">For Audience Members</h2>
                <div className="alert">
                    <h3>Commenting and attaching to slides</h3>
                    <img
                        className="gif"
                        src="guide/attachfeedbacktoslide.gif"
                    />
                    <p>
                        You can use this interface to provide comments and
                        feedback to the presenters during the talk.
                    </p>
                    <hr />
                    <h4>Attach Comments to Specific Slides</h4>
                    <ul>
                        <li>
                            To select a single slide, hover over and click it.
                        </li>
                        <li>
                            or multiple slides, drag a box over the target
                            slides.
                        </li>
                        <li>Shift-click any slide to toggle attachment.</li>
                    </ul>
                    <hr />

                    <h3>Toggle View Modes</h3>
                    <h4>Share Mode</h4>
                    <img src="guide/share-mode.png" />
                    <p>
                        In Share Mode, you can hover over comments to reply, or
                        agree. You can also edit and delete comments that you
                        have authored.
                    </p>
                    <hr />
                    <h4>Focus Mode</h4>
                    <img src="guide/focus-mode.png" />
                    <p>
                        When focus mode is on, comments are focused and do not
                        display interaction options.
                    </p>
                </div>

                <h2 id="managers">For Session Owners</h2>
                <div className="alert">
                    <h3>Logging in</h3>
                    <img
                        className="gif"
                        src="guide/logging_in_session_owner.gif"
                    />
                    <p>Login by simply typing in your password and username.</p>
                    <hr />
                    <h3>Creating an account</h3>
                    <img src="guide/create_acc.png" />
                    <p>Click on the create an account button.</p>
                    <hr />
                    <h3>View all sessions</h3>
                    <img src="guide/session_home_screen.png" />
                    <p>
                        The home page lists all your sessions. You can also
                        create new sessions here.
                    </p>
                    <hr />
                    <h3>Creating a session</h3>
                    <img className="gif" src="guide/new-session.png" />
                    <p>Click on 'New Session' to upload slides.</p>
                    <hr />
                    <h3>Uploading slides</h3>
                    <img className="gif" src="guide/add_presentations.gif" />
                    <p>
                        Drag and drop PDFs into the highlighted box to add
                        presentations. Alternatively, click on “+ new” to select
                        files from your computer.
                    </p>
                    <hr />
                    <h3>Organizing Talks</h3>
                    <h4>Changing Talk Order</h4>
                    <img
                        className="gif"
                        src="guide/changing_order_of_slides.gif"
                    />
                    After uploading multiple talks, you can use the arrows to
                    shift the order of talks.
                    <h4>Renaming Talks</h4>
                    <img className="gif" src="guide/rename_slides_2.gif" />
                    <hr />
                    <h3>Sharing a session</h3>
                    <div className="subsection">
                        <h4>Allowing presenters to add their own slides</h4>
                        <img
                            className="gif"
                            src="guide/share_presenter_link_working.gif"
                        />
                        <p>
                            To allow presenters to add their own slides click on
                            'open link.'
                            <ul>
                                <li>Home → Selected Session → Open Link</li>
                            </ul>
                        </p>
                        <hr />
                        <h4>Sharing presentation link with audience members</h4>
                        <img
                            className="gif"
                            src="guide/share_slides_with_audience_2.gif"
                        />
                        <p>
                            To share the presentation click on 'open link.'
                            <ul>
                                <li> Home → Selected Session → Open Link </li>
                                <li>
                                    Sharing this link will allow audience
                                    members to join in on the session.
                                </li>
                            </ul>
                        </p>
                    </div>
                    <hr />
                    <h3>Entering a Session</h3>
                    <img className="gif" src="guide/entering_session.gif" />
                </div>
                <h2>
                    <Link to={`/`}>
                        <span className="black"> ‹ </span> back
                    </Link>
                </h2>
                {!user && (
                    <AlertLink
                        center={true}
                        text={"Create An Account"}
                        link={`/join`}
                    />
                )}
                <h2 id="presenters">Presenters</h2>
                <h3>Getting Started</h3>
                <p>
                    Login by typing in your password and username. The home page
                    lists all your talks. [
                    <Link to={`/signin`}> Login Page </Link> ]
                </p>
                <img className="gif" src="guide/jw_signin.gif" />
                <h3>Uploading slides</h3>
                <p>
                    Drag and drop a PDF into the highlighted box to add a
                    presentations.
                    <br />
                    Share the first link with your audience to let them comment.
                </p>
                <img className="gif" src="guide/jw_newtalk.gif" />
                <h3>Facilitator</h3>
                <p>
                    To augment the feedback data, a facilitator can record the
                    discussion and connect written comments with what is said
                    during the discussion. The facilitator interface provides
                    the ability to record audio from the discussion, which can
                    later be transcribed. The facilitator can mark which
                    comments are being discussed while the discussion takes
                    place.
                </p>
                <img className="gif" src="guide/jw_audio.gif" />
                <h3>Feedback Review</h3>
                <p>
                    SlideSpecs lets you sort feedback by time, author, slide and
                    more. You can also filter by author, slide, and tag.
                </p>
                <img src="guide/review.png" />
                <h4>Transcription</h4>
                <p>
                    Press <b>generate transcript</b> to transcribe and link the
                    recorded audio from the discussion with written feedback
                    comments.
                </p>
                <hr />
                <h2 id="audience">Audience</h2>
                <h3>Adding Comments</h3>
                <p>
                    You can use this interface to provide comments and feedback
                    to the presenter during the talk. You can also edit and
                    delete comments that you have authored.
                </p>
                <img className="gif" src="guide/jw_comment.gif" />
                <h4>Attach Comments to Specific Slides</h4>
                <p>
                    To select a single slide, hover over and click it. To select
                    multiple slides, hold shift while clicking each box.
                </p>
                <h3>Discussion</h3>
                <img className="gif" src="guide/jw_discuss.gif" />
                <p>
                    Mark top-level comments for discussion; these comments will
                    show in the discussion view.
                </p>
                <h3>Toggling Views</h3>

                <p>
                    With the share view, you can hover over comments to reply,
                    agree, and discuss.
                </p>
                <h4 className="pull-right">Sharing</h4>
                <img className="outlined" src="guide/share-mode.png" />
                <p>
                    With the focus view, comments do not display any interaction
                    options.
                </p>
                <h4 className="pull-right">Focused</h4>
                <img className="outlined" src="guide/focus-mode.png" />
                <h3 className="v-pad">
                    <Link to={`/`}>
                        <span className="black"> ‹ </span> back
                    </Link>
                </h3>
                <br />
                <br />
            </div>
        );

        return (
            this.renderRedirect() || (
                <MenuContainer {...this.props} content={content} />
            )
        );
    }
}

export default GuidePage;
