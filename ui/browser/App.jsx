/* eslint-disable no-underscore-dangle */

import React from 'react';
import ReactDOM from 'react-dom';
import 'babel-polyfill';
import { BrowserRouter as Router } from 'react-router-dom';

import Page from '../src/Page.jsx';
import store from '../src/store.js';

store.initialData = window.__INITIAL_DATA__;
store.userData = window.__USER_DATA__;

const element = (
  <Router>
    <Page />
  </Router>
);

ReactDOM.hydrate(element, document.getElementById('content'));

if (module.hot) {
  module.hot.accept();
}
