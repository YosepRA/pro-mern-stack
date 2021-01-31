/* eslint-disable react/prefer-stateless-function */

import React from 'react';

export default class IssueFilter extends React.Component {
  render() {
    return (
      <div>
        <a href="/#/issues">All</a>
        {' | '}
        <a href="/#/issues?status=New">New</a>
        {' | '}
        <a href="/#/issues?status=Assigned">Assigned</a>
      </div>
    );
  }
}
