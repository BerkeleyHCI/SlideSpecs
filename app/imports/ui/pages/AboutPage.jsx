/* eslint max-len 0 */
import React from 'react';
import {Link} from 'react-router-dom';

import BaseComponent from '../components/BaseComponent.jsx';
import MenuContainer from '../containers/MenuContainer.jsx';
import AlertLink from '../components/AlertLink.jsx';

class AboutPage extends BaseComponent {
  render() {
    const {user} = this.props;
    const content = (
      <div className="main-content" id="guide-container">
        <h3 className="pull-right">
          <Link to={`/`}>
            <span className="black"> ‹ </span> back
          </Link>
        </h3>

        <h1>About</h1>
        {!user && (
          <AlertLink center={true} text={'Create An Account'} link={`/join`} />
        )}
        <div className="v-pad">
          SlideSpecs is a collaborative presentation feedback platform. You can
          use SlideSpecs to:
          <dl>
            <dt>Collect rich feedback</dt>
            <dd>
              SlideSpecs can help organize feedback on your talk, and lets the
              audience reference specific slides, other comments, and topic
              tags.
            </dd>

            <dt>Record discussions</dt>
            <dd>
              A discussion view lists all comments that have been marked for
              discussion, and you can record the talk with SlideSpecs directly.
            </dd>

            <dt>Review talk feedback</dt>
            <dd>
              SlideSpecs provides sorting and filtering mechanisms to review
              audience feedback. A transcribed discussion is linked with the
              audio recording of the discussion. Comments, audio, and the
              transcript can be reviewed or exported.
            </dd>
          </dl>
          <div className="v-pad">
            Check out the [ <Link to="/guide"> user guide </Link> ] to see more
            of what SlideSpecs can do.
          </div>
        </div>

        <h3>Contact</h3>
        <p>
          Please email Jeremy Warner (first.last at berkeley.edu) with any
          feedback or questions.
        </p>

        <h3 className="v-pad">
        <div className="alert">
          SlideSpecs is a collaborative presentation feedback platform.
          <hr />
          Check out the <Link to="/guide"> user guide </Link>
          to see what SlideSpecs can do.
        </div>

        <h3>For Instructors</h3>
        <div className="alert">
          Here is the need-to-know information about starting to use SlideSpecs:
          <ul>
            <li>
              <b>When:</b> As earlier as the day of a class presentation or
              feedback session.
            </li>
            <li>
              <b>What:</b> SlideSpecs can guide and organize feedback. It
              generates images based on a presentation file, and provides a
              shared view to gather feedback from an audience. Either upload all
              files yourself, or send a link to students for them to add their
              own files.
            </li>
            <li>
              <b>Why:</b> The audience works in a shared view, able to see each
              other's comments. This allows for real-time and ad-hoc
              collaboration (i.e., replying to or agreeing with others). For the
              presenter, SlideSpecs provides organization and filtering
              mechanisms to review audience feedback.
            </li>
          </ul>
        </div>

        <h3>Contact</h3>
        <div className="alert">
          <p>
            Please email Jeremy Warner (first.last at berkeley.edu) with
            feedback or questions.
          </p>
        </div>

        <h3>
          <Link to={`/`}>
            <span className="black"> ‹ </span> back
          </Link>
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
