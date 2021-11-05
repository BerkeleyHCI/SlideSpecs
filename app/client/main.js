/* global document */

import { Meteor } from "meteor/meteor";
import React from "react";
import { render } from "react-dom";
import "regenerator-runtime/runtime.js";

import AppContainer from "../imports/ui/containers/AppContainer.jsx";

Meteor.startup(() => {
    render(<AppContainer />, document.getElementById("app"));
});
