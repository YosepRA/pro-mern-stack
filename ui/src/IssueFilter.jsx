/* eslint-disable react/prefer-stateless-function */

import React from 'react';
import { withRouter } from 'react-router-dom';

class IssueFilter extends React.Component {
  constructor() {
    super();
    this.onChangeStatus = this.onChangeStatus.bind(this);
  }

  onChangeStatus(event) {
    const { history } = this.props;
    const status = event.target.value;

    history.push({
      pathname: '/issues',
      search: status.length > 0 ? `?status=${status}` : '',
    });
  }

  render() {
    return (
      <div>
        Status:{' '}
        <select onChange={this.onChangeStatus}>
          <option value="">All</option>
          <option value="New">New</option>
          <option value="Assigned">Assigned</option>
          <option value="Fixed">Fixed</option>
          <option value="Closed">Closed</option>
        </select>
      </div>
    );
  }
}

export default withRouter(IssueFilter);
