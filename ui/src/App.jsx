import React from 'react';
import ReactDOM from 'react-dom';
import 'whatwg-fetch';
import 'babel-polyfill';

import IssueList from './IssueList.jsx';

const element = <IssueList />;

ReactDOM.render(element, document.getElementById('content'));
