/* eslint max-len 0 */
import React from 'react';
import BaseComponent from '../components/BaseComponent.jsx';
import MenuContainer from '../containers/MenuContainer.jsx';
import {Link} from 'react-router-dom';

class AboutPage extends BaseComponent {
  render() {
    const content = (
      <div className="main-content" id="guide-container">
        <h3 className="pull-right">
          <Link to={`/`}>
            <span className="black"> ‹ </span> back
          </Link>
        </h3>

        <h1>About</h1>
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
