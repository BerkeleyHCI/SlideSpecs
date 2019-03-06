/* eslint max-len 0 */

import React from "react";
import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session.js";
import PropTypes from "prop-types";
import queryString from "query-string";
import { ToastContainer, toast, cssTransition } from "react-toastify";
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";

import AppModal from "../components/AppModal.jsx";
import Loading from "../components/Loading.jsx";
import AppNotification from "../components/AppNotification.jsx";
import BaseComponent from "../components/BaseComponent.jsx";
import UserContainer from "../containers/UserContainer.jsx";
import TalkContainer from "../containers/TalkContainer.jsx";

import AuthPageSignIn from "../pages/AuthPageSignIn.jsx";
import AuthPageJoin from "../pages/AuthPageJoin.jsx";
import TalkListPage from "../pages/TalkListPage.jsx";
import TalkPage from "../pages/TalkPage.jsx";
import GuidePage from "../pages/GuidePage.jsx";
import AboutPage from "../pages/AboutPage.jsx";
import CommentPage from "../pages/CommentPage.jsx";
import DiscussPage from "../pages/DiscussPage.jsx";
import FacilitatePage from "../pages/FacilitatePage.jsx";
import ReviewPage from "../pages/ReviewPage.jsx";
import NotFoundPage from "../pages/NotFoundPage.jsx";
import ForbiddenPage from "../pages/ForbiddenPage.jsx";

import { checkUserTalk } from "../../api/talks/methods.js";

const CONNECTION_ISSUE_TIMEOUT = 5000;

const Fade = cssTransition({
  enter: "fadeIn",
  exit: "fadeOut",
  duration: [200, 0]
});

export default class App extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = { showConnectionIssue: false, modal: { isOpen: false } };
  }

  renewSubscription = () => {
    const { user, sub } = this.props;
    if (user && !sub) {
      Session.set("subscription", { type: "user", _id: user._id });
    }
  };

  componentDidMount = () => {
    this.renewSubscription();
    setTimeout(() => {
      /* eslint-disable react/no-did-mount-set-state */
      this.setState({ showConnectionIssue: true });
    }, CONNECTION_ISSUE_TIMEOUT);
  };

  componentDidUpdate = () => {
    this.renewSubscription();
  };

  getSharedProps = () => {
    return {
      ...this.props,
      clearModal: this.clearModal,
      setModal: this.setModal
    };
  };

  setModal = m => {
    this.setState({ modal: m });
  };

  clearModal = () => {
    this.setState({ modal: { isOpen: false } });
  };

  preRender = (match, Comp, pType) => {
    const shared = this.getSharedProps();
    if (pType == "user") {
      return <UserContainer Comp={Comp} {...shared} id={Meteor.userId()} />;
    } else if (pType == "talk") {
      return <TalkContainer Comp={Comp} {...shared} id={match.params.id} />;
    } else {
      return <NotFoundPage />;
    }
  };

  renderGuidePage = ({ match }) => {
    return this.preRender(match, GuidePage, "user");
  };

  renderAboutPage = ({ match }) => {
    return this.preRender(match, AboutPage, "user");
  };

  renderTalkList = ({ match }) => {
    return this.preRender(match, TalkListPage, "user");
  };

  renderComment = ({ match }) => {
    return this.preRender(match, CommentPage, "talk");
  };

  renderDiscuss = ({ match }) => {
    return this.preRender(match, DiscussPage, "talk");
  };

  renderTalk = ({ match }) => {
    return this.preRender(match, TalkPage, "talk");
  };

  renderFacilitate = ({ match }) => {
    return this.preRender(match, FacilitatePage, "talk");
  };

  renderReview = ({ match }) => {
    return this.preRender(match, ReviewPage, "talk");
  };

  renderSecure = () => {
    if (location.protocol === "http:" && location.hostname !== "localhost") {
      console.log("moving to https...");
      const secure = "https:" + window.location.href.substring(5);
      window.location.replace(secure);
    }
  };

  renderContent = ({ location, ...other }) => {
    //this.renderSecure(); // http -> https
    const { user, talks, files, loading } = this.props;
    const params = queryString.parse(location.search);
    const shared = this.getSharedProps();
    const { modal } = this.state;
    this.showConnection();

    return (
      <div id="container">
        <AppModal {...modal} />
        <ToastContainer
          type="info"
          transition={Fade}
          closeButton={false}
          hideProgressBar={true}
          toastClassName="dark-toast"
          position="top-right"
          autoClose={2000}
          pauseOnHover={false}
        />
        {loading ? (
          <Loading key="loading" />
        ) : (
          <Switch location={location}>
            <Route path="/join" component={AuthPageJoin} {...shared} />
            <Route path="/signin" component={AuthPageSignIn} {...shared} />
            <Route path="/guide" render={this.renderGuidePage} />
            <Route path="/about" render={this.renderAboutPage} />
            <Route path="/comment/:id" render={this.renderComment} />
            <Route path="/discuss/:id" render={this.renderDiscuss} />    
            <Route path="/facilitate/:id" render={this.renderFacilitate} />      
            <PrivateRoute exact path="/" render={this.renderTalkList} />
            <PrivateRoute path="/talks/:id" render={this.renderTalk} />
            <PrivateRoute path="/review/:id" render={this.renderReview} />
            <PrivateRoute render={() => <NotFoundPage />} />
          </Switch>
        )}
      </div>
    );
  };

  showConnection = () => {
    const { showConnectionIssue } = this.state;
    const { connected } = this.props;
    if (showConnectionIssue && !connected) {
      toast(() => (
        <AppNotification
          msg="connection issue"
          desc="trying to reconnect..."
          icon="refresh"
        />
      ));
    }
  };

  render() {
    return (
      <BrowserRouter>
        <Route render={this.renderContent} />
      </BrowserRouter>
    );
  }
}

const PrivateRoute = ({ render, ...other }) => {
  const user = Meteor.user();
  const matchId = other.computedMatch.params.id || "";
  let loc = window.location.pathname;
  let out;

  const sharedPaths = ["/", "/upload/:id"];
  const talkPermit = checkUserTalk.call({ matchId });
  const shared = sharedPaths.includes(other.path);
  const permitted = shared || talkPermit;

  //console.log(Meteor.loggingIn(), user, other.path, matchId, loc);
  //console.log(saved, Meteor.loggingOut(), loc);
  const saved = localStorage.getItem("feedbacks.referringLink");

  if (user && permitted) {
    out = render;
  } else if (!user && !Meteor.loggingOut()) {
    localStorage.setItem("feedbacks.referringLink", loc);
    out = () => (loc !== "/signin" ? <Redirect to="/signin" /> : null);
  } else if (!permitted) {
    out = () => <ForbiddenPage user={user} />;
  }

  return <Route {...other} render={out} />;
};

App.propTypes = {
  connected: PropTypes.bool.isRequired, // server connection status
  loading: PropTypes.bool.isRequired, // subscription status
  user: PropTypes.object, // current meteor user
  talks: PropTypes.array,
  comments: PropTypes.array,
  files: PropTypes.array,
  images: PropTypes.array
};

App.defaultProps = {
  user: null,
  talks: [],
  comments: [],
  files: [],
  images: []
};
