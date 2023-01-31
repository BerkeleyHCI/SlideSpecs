import React from "react";
import { Link } from "react-router-dom";

import BaseComponent from "../components/BaseComponent.jsx";
import MenuContainer from "../containers/MenuContainer.jsx";
import AlertLink from "../components/AlertLink.jsx";

class AboutPage extends BaseComponent {
    render() {
        const { user } = this.props;
        const content = (
            <div className="main-content" id="guide-container">
                <h3 className="pull-right">
                    <span className="black"> ‹ </span>
                    <Link to={`/`}>back</Link>
                </h3>

                <h1>About</h1>
                {!user && (
                    <AlertLink
                        center={true}
                        text={"Create An Account"}
                        link={`/signup`}
                    />
                )}
                <div className="v-pad">
                    SlideSpecs is a collaborative presentation feedback
                    platform. You can use SlideSpecs to:
                    <dl>
                        <dt>Collect rich feedback</dt>
                        <dd>
                            SlideSpecs can help organize feedback on your talk,
                            and lets the audience reference specific slides,
                            other comments, and topic tags.
                        </dd>

                        <dt>Record discussions</dt>
                        <dd>
                            A discussion view lists all comments that have been
                            marked for discussion, and you can record the talk
                            with SlideSpecs directly.
                        </dd>

                        <dt>Review talk feedback</dt>
                        <dd>
                            SlideSpecs provides sorting and filtering mechanisms
                            to review audience feedback. A transcribed
                            discussion is linked with the audio recording of the
                            discussion. Comments, audio, and the transcript can
                            be reviewed or exported.
                        </dd>
                    </dl>
                    <div className="v-pad">
                        <p>
                            See the [<Link to="/guide">user guide</Link>] for
                            more of what SlideSpecs can do.
                        </p>

                        <p>
                            Please contact [
                            <a href="https://jeremywrnr.com/">Jeremy Warner</a>]
                            with feedback or questions.
                        </p>

                        <p>
                            The [
                            <a href="https://github.com/BerkeleyHCI/SlideSpecs">
                                source code
                            </a>
                            ] for SlideSpecs is on GitHub.
                        </p>
                    </div>
                </div>

                <h3>
                    <span className="black"> ‹ </span>
                    <Link to={`/`}>back</Link>
                </h3>
            </div>
        );

        return (
            this.renderRedirect() || (
                <MenuContainer {...this.props} content={content} />
            )
        );
    }
}

export default AboutPage;
