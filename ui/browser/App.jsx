import React from 'react';
import ReactDOM from 'react-dom';
import 'whatwg-fetch';
import 'babel-polyfill';
import { BrowserRouter as Router } from 'react-router-dom';

import Page from '../src/Page.jsx';

const element = (
  <Router>
    <Page />
  </Router>
);

ReactDOM.render(element, document.getElementById('content'));

if (module.hot) {
  module.hot.accept();
}