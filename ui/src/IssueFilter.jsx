/* eslint-disable react/prefer-stateless-function */

import React from 'react';
import { Link } from 'react-router-dom';

export default class IssueFilter extends React.Component {
  render() {
    return (
      <div>
        <Link to={{ pathname: '/issues' }}>All</Link>
        {' | '}
        <Link to={{ pathname: '/issues', search: '?status=New' }}>New</Link>
        {' | '}
        <Link to={{ pathname: '/issues', search: '?status=Assigned' }}>
          Assigned
        </Link>
      </div>
    );
  }
}
