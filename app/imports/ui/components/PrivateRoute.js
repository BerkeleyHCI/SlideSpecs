import React, {Component} from 'react';
import {Meteor} from 'meteor/meteor';
import {BrowserRouter, Route, Redirect} from 'react-router-dom';

export default const PrivateRoute = ({user, render, ...other}) => {
  let loc = window.location.pathname;
  let out;
  if (user) {
    out = render;
  } else {
    out = () => (loc !== '/signin' ? <Redirect to="/signin" /> : null);
  }

  return <Route {...other} render={out} />;
};
