import React from 'react';
import {Session} from 'meteor/session.js';
import BaseComponent from '../components/BaseComponent.jsx';
import MenuContainer from '../containers/MenuContainer.jsx';
import TalkListItem from '../components/TalkListItem.jsx';
import NameSet from '../components/NameSet.jsx';
import {Link} from 'react-router-dom';

class GuidePage extends BaseComponent {
  render() {
    const content = (
      <div className="main-content" id="guide-container">
        <h1>Presenter</h1>
        <div class="alert">
          <h3>Uploading slides</h3>
          <img class="gif" src="guide/join_add_presenter_slides.gif" />
          <hr />
          <h3>Reviewing Comments</h3>
        </div>

        <h1>Audience Member</h1>
        <div class="alert">
          <h3>Commenting and attaching to slides</h3>
          <img class="gif" src="guide/attachfeedbacktoslide.gif" />
          <p>
            You can use this interface to provide comments and feedback to the
            presenters during the talk.
          </p>

          <h5>Selecting Slides for Comment Tagging</h5>
          <ul>
            <li>To select single slides, hover over them and click</li>
            <li>
              To select multiple slides, click and drag over the slides you want
              to select or shift and click on the slides you want to select.
            </li>
          </ul>
          <hr />
          <h3>Marking comments</h3>
          <h5>Agree with a comment</h5>
          <h5>Mark a comment for discussion</h5>
          <hr />
          <h3>Deleting comments</h3>
          <hr />
          <h3>View Modes</h3>
          <h5>Focus Mode</h5>
          <img src="guide/focus-mode.png" />
          <p>
            When focus mode is on, comments are focused and do not display
            interaction options.
          </p>
          <h5>Share Mode</h5>
          <img src="guide/share-mode.png" />
          <p>
            When share mode is on, users can cover over comments to reply,
            agree, or mark comments for discussion.
          </p>
          <p>
            If users are editing their own comments, they can also edit or
            delete.
          </p>
        </div>

        <h1>For Session Owners</h1>
        <div class="alert">
          <h3>Logging in</h3>
          <img class="gif" src="guide/logging_in_session_owner.gif" />
          <p>Login by simply typing in your password and username.</p>
          <hr />
          <h3>Creating an account</h3>
          <p>Click on the create an account button.</p>
          <img src="guide/create_acc.png" />
          <hr />
          <h3>View all sessions</h3>
          <img src="guide/session_home_screen.png" />
          <p>
            The first page will display all created sessions or allow you to
            create a new session.
          </p>
          <hr />
          <h3>Creating a session</h3>
          <img class="gif" src="guide/new-session.png" />
          <p>Click on "New Session" to upload slides.</p>
          <hr />
          <h3>Uploading slides</h3>
          <img class="gif" src="guide/add_presentations.gif" />
          <p>
            Drag and drop PDFs or Powerpoints into the highlighted region to add
            presentations or click on “+ new” to select a file from your
            computer.
          </p>
          <hr />
          <h3>Organizing Slides</h3>
          <h5>Changing Slide Order</h5>
          <img class="gif" src="guide/changing_order_of_slides.gif" />
          <h5>Renaming Slides</h5>
          <img class="gif" src="guide/rename_slides_2.gif" />
          <h5>Removing Slides</h5>
          <hr />
          <h3>Sharing a session</h3>
          <div class="subsection">
            <h5>Allowing presenters to add their own slides</h5>
            <img class="gif" src="guide/share_presenter_link_working.gif" />
            <p>
              To allow presenters to add their own slides click on “open link.”
              <ul>
                <li>Home > Selected Session > Open Link</li>
              </ul>
            </p>
            <h5>Sharing presentation link with audience members</h5>
            <img class="gif" src="guide/share_slides_with_audience_2.gif" />
            <p>
              To share the presentation click on “open link.”
              <ul>
                <li> Home > Selected Session > Open Link </li>
                <li>
                  Sharing this link will allow audience members to join in on
                  the session.
                </li>
              </ul>
            </p>
          </div>

          <hr />
          <h3>Entering a Session</h3>
          <img class="gif" src="guide/entering_session.gif" />
        </div>
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
