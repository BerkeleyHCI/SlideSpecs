import React from "react";
import AlertLink from "../components/AlertLink.jsx";
import BaseComponent from "../components/BaseComponent.jsx";
import { Link } from "react-router-dom";
import MenuContainer from "../containers/MenuContainer.jsx";

//<img className="gif" src="guide/jw_facilitate.gif" />
//<img className="gif" src="guide/jw_transcription.gif" />

class GuidePage extends BaseComponent {
    render() {
        const { user } = this.props;
        const content = (
            <div className="main-content" id="guide-container">
                <h3 className="pull-right">
                    <span className="black"> ‹ </span>
                    <Link to={`/`}>back</Link>
                </h3>
                <h1>User Guide</h1>
                <div className="v-pad">
                    Jump to: <a href="#presenters">presenters</a> |{" "}
                    <a href="#audience">audience</a> |{" "}
                    <a href="#instructors">instructors</a>
                    <br />
                    <br />
                    Check out{" "}
                    <a href="https://slidespecs.berkeley.edu/comment/W3dadgycsieaxMESB">
                        an example talk with feedback
                    </a>
                    .
                    <br />
                    <br />
                    See also: <Link to="/about">about SlideSpecs.</Link>
                    <br />
                    <br />
                    <br />
                </div>

                <h2 id="presenters">For Presenters</h2>
                <div className="alert">
                    <h3>Getting Started</h3>
                    <p>
                        Login by typing in your password and username. The [{" "}
                        <Link to={`/login`}>home page</Link> ] lists all of your
                        talks.
                    </p>
                    <img className="gif" src="guide/jw_signin.gif" />
                    <hr />
                    <h3>Uploading slides</h3>
                    <p>
                        Drag and drop a PDF into the highlighted box to add a
                        presentations.
                        <br />
                        Share the first link with your audience to let them
                        comment.
                    </p>
                    <img className="gif" src="guide/jw_newtalk.gif" />
                    <hr />
                    <h3>Feedback Review</h3>
                    <p>
                        SlideSpecs lets you sort and filter feedback by time,
                        author, or slide.
                    </p>
                    <img src="guide/review.png" />
                </div>

                <h2 id="audience">For Audience Members</h2>
                <div className="alert">
                    <h3>Adding Comments</h3>
                    <p>
                        You can use this interface to provide comments and
                        feedback to the presenter during the talk.
                        <br /> You can also edit and delete comments that you
                        have authored.
                    </p>
                    <img className="gif" src="guide/jw_comment.gif" />
                    <h4>Attach Comments to Specific Slides</h4>
                    <p>
                        To select a single slide to associate your comment with,
                        just click it.
                        <br />
                        To select multiple slides, hold shift while clicking
                        each slide.
                    </p>
                    <hr />
                    <h3>Share and Focus View Modes</h3>
                    <p>
                        With the share view, you can hover over comments to
                        reply, agree, and discuss.
                    </p>
                    <img className="outlined" src="guide/share-mode.png" />
                    <p>
                        With the focus view, comments hide any interaction
                        options.
                    </p>
                    <img className="outlined" src="guide/focus-mode.png" />
                </div>

                <h2 id="instructors">For Instructors</h2>
                <div className="alert">
                    Need-to-know information about starting with SlideSpecs:
                    <ul>
                        <li>
                            <b>When:</b> As earlier as the day of a class
                            presentation or feedback session.
                        </li>
                        <li>
                            <b>What:</b> SlideSpecs can guide and organize
                            feedback. It generates images based on a
                            presentation file, and provides a shared view to
                            gather feedback from an audience. Either upload all
                            files yourself, or send a link to students for them
                            to add their own files.
                        </li>
                        <li>
                            <b>Why:</b> The audience works in a shared view,
                            able to see each other&apos;s comments. This allows
                            for real-time and ad-hoc collaboration (i.e.,
                            replying to or agreeing with others). For the
                            presenter, SlideSpecs provides organization and
                            filtering mechanisms to review audience feedback.
                        </li>
                    </ul>
                </div>
                <div className="alert">
                    <h3>Logging in</h3>
                    <img
                        className="gif"
                        src="guide/logging_in_session_owner.gif"
                    />
                    <p>
                        If it is your first time using SlideSpecs, create an
                        account.
                        <br />
                        Then, login by simply typing in your password and
                        username.
                    </p>
                    <hr />
                    <h3>View all sessions</h3>
                    <img src="guide/session_home_screen.png" />
                    <p>
                        The home page lists all your sessions. You can also
                        create new sessions here.
                    </p>
                    <hr />
                    <h3>Uploading slides</h3>
                    <img className="gif" src="guide/add_presentations.gif" />
                    <p>
                        Drag and drop PDFs into the highlighted box to add
                        presentations. <br /> Alternatively, click "+ new" to
                        select files from your computer.
                    </p>
                    <hr />
                    <h3>Organizing Talks</h3>
                    After uploading multiple talks, you can use the arrows to
                    shift the order of talks. <br />
                    You can also rename talks with the "rename" button.
                    <hr />
                    <h3>Sharing a session</h3>
                    <div className="subsection">
                        <h4>Allowing presenters to add their own slides</h4>
                        <img
                            className="gif"
                            src="guide/share_presenter_link_working.gif"
                        />
                        To allow presenters to add their own slides click on
                        'open link.'
                        <ul>
                            <li>Home → Selected Session → Open Link</li>
                        </ul>
                        <hr />
                        <h4>Sharing presentation link with audience members</h4>
                        <img
                            className="gif"
                            src="guide/share_slides_with_audience_2.gif"
                        />
                        To share the presentation click on 'open link.'
                        <ul>
                            <li> Home → Selected Session → Open Link </li>
                            <li>
                                Sharing this link will allow audience members to
                                join in on the session.
                            </li>
                        </ul>
                    </div>
                    <hr />
                    <h3>Entering a Session</h3>
                    <img className="gif" src="guide/entering_session.gif" />
                    <hr />
                    <h3 id="facilitators">Facilitators</h3>
                    <p>
                        To augment the feedback data, a discussion facilitator
                        (e.g., an instructor or session chair) can record any
                        verbal discussion and connect written comments with what
                        is said during the discussion. The facilitator interface
                        provides the ability to record audio from the
                        discussion, which can later be transcribed. The
                        facilitator can mark which comments are being discussed.
                    </p>
                    <img className="gif" src="guide/jw_audio.gif" />
                    <p>
                        Mark top-level comments for discussion; these comments
                        will show in the discussion view.
                    </p>
                    <img className="gif" src="guide/jw_discuss.gif" />
                </div>

                {!user && (
                    <AlertLink
                        center={true}
                        text={"Create An Account"}
                        link={`/signup`}
                    />
                )}

                <div className="v-pad">
                    Please see the [ <Link to="/about">about page</Link> ] for
                    more details and contact info.
                </div>

                <h3>
                    <span className="black"> ‹ </span>
                    <Link to={`/`}>back</Link>
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
