import React, {Component} from 'react';
import {Link} from 'react-router-dom';

import BaseComponent from '../components/BaseComponent.jsx';
import MenuContainer from '../containers/MenuContainer.jsx';
import AlertLink from '../components/AlertLink.jsx';

//<img className="gif" src="guide/jw_facilitate.gif" />
//<img className="gif" src="guide/jw_transcription.gif" />

//<VideoLink video={'hrCHEy5k_rU'} />
//<VideoLink video={'mHI9E5xycc4'} />

class VideoLink extends Component {
  render() {
    const {video} = this.props;
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
        <h2 id="presenters">Presenters</h2>
        <h3>Getting Started</h3>
        <p>
          Login by typing in your password and username. The home page lists all
          your talks. [<Link to={`/signin`}> Login Page </Link> ]
        </p>
        <img className="gif" src="guide/jw_signin.gif" />
        <h3>Uploading slides</h3>
        <p>
          Drag and drop a PDF into the highlighted box to add a presentations.
          <br />
          Share the first link with your audience to let them comment.
        </p>
        <img className="gif" src="guide/jw_newtalk.gif" />
        <h3>Facilitator</h3>
        <p>
          To augment the feedback data, a facilitator can record the discussion
          and connect written comments with what is said during the discussion.
          The facilitator interface provides the ability to record audio from
          the discussion, which can later be transcribed. The facilitator can
          mark which comments are being discussed while the discussion takes
          place.
        </p>
        <img className="gif" src="guide/jw_audio.gif" />
        <h3>Feedback Review</h3>
        <p>
          SlideSpecs lets you sort feedback by time, author, slide and more. You
          can also filter by author, slide, and tag.
        </p>
        <img src="guide/review.png" />
        <h4>Transcription</h4>
        <p>
          Press <b>generate transcript</b> to transcribe and link the recorded
          audio from the discussion with written feedback comments.
        </p>
        <hr />
        <h2 id="audience">Audience</h2>
        <h3>Adding Comments</h3>
        <p>
          You can use this interface to provide comments and feedback to the
          presenter during the talk. You can also edit and delete comments that
          you have authored.
        </p>
        <img className="gif" src="guide/jw_comment.gif" />
        <h4>Attach Comments to Specific Slides</h4>
        <p>
          To select a single slide, hover over and click it. To select multiple
          slides, hold shift while clicking each box.
        </p>
        <h3>Discussion</h3>
        <img className="gif" src="guide/jw_discuss.gif" />
        <p>
          Mark top-level comments for discussion; these comments will show in
          the discussion view.
        </p>
        <h3>Toggling Views</h3>

        <p>
          With the share view, you can hover over comments to reply, agree, and
          discuss.
        </p>
        <h4 className="pull-right">Sharing</h4>
        <img className="outlined" src="guide/share-mode.png" />
        <p>
          With the focus view, comments do not display any interaction options.
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
