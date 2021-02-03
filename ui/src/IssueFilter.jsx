/* eslint-disable react/prefer-stateless-function */

import React from 'react';
import { withRouter } from 'react-router-dom';
import URLSearchParams from 'url-search-params';

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
    const {
      location: { search },
    } = this.props;
    const params = new URLSearchParams(search);

    return (
      <div>
        Status:{' '}
        <select
          onChange={this.onChangeStatus}
          value={params.get('status') || ''}
        >
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
