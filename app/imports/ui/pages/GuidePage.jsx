import React from 'react';
import {Link} from 'react-router-dom';

import BaseComponent from '../components/BaseComponent.jsx';
import MenuContainer from '../containers/MenuContainer.jsx';
import AlertLink from '../components/AlertLink.jsx';

//<img className="gif" src="guide/jw_facilitate.gif" />
//<img className="gif" src="guide/jw_transcription.gif" />

class GuidePage extends BaseComponent {
  render() {
    const {user} = this.props;
    const content = (
      <div className="main-content" id="guide-container">
        <h3 className="pull-right">
          <Link to={`/`}>
            <span className="black"> ‹ </span> back
          </Link>
        </h3>
        <h1>User Guide</h1>
        {!user && (
          <AlertLink center={true} text={'Create An Account'} link={`/join`} />
        )}

        <div className="alert">
          for:
          <a href="#presenters"> the presenter</a> |{' '}
          <a href="#audience">the audience</a>
        </div>

        <h2 id="presenters">Presenters</h2>
        <div className="alert">
          <h3>Getting Started</h3>
          <img className="gif" src="guide/jw_signin.gif" />
          <p>
            Login by typing in your password and username. [
            <Link to={`/signin`}> Login Page </Link> ]
          </p>
          <p>The home page lists all your talks.</p>
          <hr />
          <h3>Uploading slides</h3>
          <img className="gif" src="guide/jw_newtalk.gif" />
          <p>
            Drag and drop a PDF into the highlighted box to add a presentations.
          </p>
          <p>Share the first link with your audience to let them comment.</p>
          <hr />
          <h3>Facilitator</h3>
          <img className="gif" src="guide/jw_audio.gif" />
          <p>
            To augment the feedback data, a facilitator can record the
            discussion and connect written comments with what is said during the
            discussion. The facilitator interface provides the ability to record
            audio from the discussion, which can later be transcribed. The
            facilitator can mark which comments are being discussed while the
            discussion takes place.
          </p>
          <hr />
          <h3>Feedback Review</h3>
          <img src="guide/review.png" />
          <p>
            SlideSpecs lets you sort feedback by time, author, slide and more.
          </p>
          <p>You can also filter by author, slide, and tag.</p>
          <hr />
          <h4>Transcription</h4>
          <p>
            Press <b>generate transcript</b> to transcribe and link the recorded
            audio from the discussion with written feedback comments.
          </p>
        </div>

        <h2 id="audience">Audience</h2>
        <div className="alert">
          <h3>Adding Comments</h3>
          <img className="gif" src="guide/jw_comment.gif" />
          <p>
            You can use this interface to provide comments and feedback to the
            presenter during the talk.
          </p>
          <hr />
          <h4>Attach Comments to Specific Slides</h4>
          <ul>
            <li>To select a single slide, hover over and click it.</li>
            <li>or multiple slides, hold shift while clicking a box.</li>
          </ul>
          <hr />
          <h3>Discussion</h3>
          <img className="gif" src="guide/jw_discuss.gif" />
          <p>
            Mark top-level comments for discussion; these comments will show in
            the discussion view.
          </p>
          <hr />
          <h3>Toggling Views</h3>
          <h4 className="pull-right">Sharing</h4>
          <img className="outlined" src="guide/share-mode.png" />
          <p>
            With the share view, you can hover over comments to reply, agree,
            and discuss. You can also edit and delete comments that you have
            authored.
          </p>
          <h4 className="pull-right">Focused</h4>
          <img className="outlined" src="guide/focus-mode.png" />
          <p>
            With the focus view, comments do not display any interaction
            options.
          </p>
        </div>

        <h2>
          <Link to={`/`}>
            <span className="black"> ‹ </span> back
          </Link>
        </h2>
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

/*
   <h3>Creating a talk</h3>
   <img className="gif" src="guide/new-session.png" />
   <p>Click on 'New Talk' to upload slides.</p>
   <hr />
   <hr />
   <h3>Organizing Talks</h3>
   <h4>Changing Talk Order</h4>
   <img className="gif" src="guide/changing_order_of_slides.gif" />
   After uploading multiple talks, you can use the arrows to shift the
   order of talks.
   <h4>Renaming Talks</h4>
   <img className="gif" src="guide/rename_slides_2.gif" />
   <hr />
   <hr />
   <h3>Entering a Talk</h3>
   <img className="gif" src="guide/entering_session.gif" />
   <h3>Sharing a session</h3>
   <div className="subsection">
   <h4>Allowing presenters to add their own slides</h4>
   <img className="gif" src="guide/share_presenter_link_working.gif" />
   <p>
   To allow presenters to add their own slides click on 'open link.'
   </p>
   <ul>
   <li>Home > Selected Talk > Open Link</li>
   </ul>
   <hr />
   <h4>Sharing presentation link with audience members</h4>
   <img className="gif" src="guide/share_slides_with_audience_2.gif" />
   <p>To share the presentation click on 'open link.'</p>
   <ul>
   <li> Home > Selected Talk > Open Link </li>
   <li>
   Sharing this link will allow the audience to join the session.
   </li>
   </ul>
   </div>
   <h3>Creating an account</h3>
   <img src="guide/create_acc.png" />
   */

export default GuidePage;
