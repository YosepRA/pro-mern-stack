/* eslint-disable react/prefer-stateless-function */

import React from 'react';
import { withRouter } from 'react-router-dom';
import URLSearchParams from 'url-search-params';

class IssueFilter extends React.Component {
  constructor({ location: { search } }) {
    super();

    const params = new URLSearchParams(search);
    this.state = {
      status: params.get('status') || '',
      changed: false,
    };

    this.onChangeStatus = this.onChangeStatus.bind(this);
    this.applyFilter = this.applyFilter.bind(this);
    this.showOriginalFilter = this.showOriginalFilter.bind(this);
  }

  componentDidUpdate(prevProps) {
    const {
      location: { search: prevSearch },
    } = prevProps;
    const {
      location: { search: currentSearch },
    } = this.props;

    if (prevSearch !== currentSearch) this.showOriginalFilter();
  }

  onChangeStatus({ target: { value } }) {
    this.setState({ status: value, changed: true });
  }

  showOriginalFilter() {
    const {
      location: { search },
    } = this.props;
    const params = new URLSearchParams(search);

    this.setState({ status: params.get('status') || '', changed: false });
  }

  applyFilter() {
    const { history } = this.props;
    const { status } = this.state;

    history.push({
      pathname: '/issues',
      search: status.length > 0 ? `?status=${status}` : '',
    });
  }

  render() {
    const { status, changed } = this.state;

    return (
      <div>
        Status:{' '}
        <select onChange={this.onChangeStatus} value={status}>
          <option value="">All</option>
          <option value="New">New</option>
          <option value="Assigned">Assigned</option>
          <option value="Fixed">Fixed</option>
          <option value="Closed">Closed</option>
        </select>{' '}
        <button type="button" onClick={this.applyFilter}>
          Apply
        </button>{' '}
        <button
          type="button"
          onClick={this.showOriginalFilter}
          disabled={!changed}
        >
          Reset
        </button>
      </div>
    );
  }
}

export default withRouter(IssueFilter);
