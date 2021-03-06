import React, { Component } from 'react';
import { Panel, Table } from 'react-bootstrap';
import URLSearchParams from 'url-search-params';

import IssueFilter from './IssueFilter.jsx';
import graphQLFetch from './graphQLFetch.js';
import store from './store.js';
import withToast from './withToast.jsx';

const statuses = ['New', 'Assigned', 'Fixed', 'Closed'];

class IssueReport extends Component {
  static async fetchData(match, search, showError) {
    const params = new URLSearchParams(search);
    const vars = {};
    // Status filter.
    if (params.get('status')) vars.status = params.get('status');
    // Effort range filter.
    const effortMin = parseInt(params.get('effortMin'), 10);
    if (!Number.isNaN(effortMin)) vars.effortMin = effortMin;
    const effortMax = parseInt(params.get('effortMax'), 10);
    if (!Number.isNaN(effortMax)) vars.effortMax = effortMax;

    const query = `
      query issueCounts(
        $status: StatusType
        $effortMin: Int
        $effortMax: Int
      ) {
        issueCounts(
          status: $status
          effortMin: $effortMin
          effortMax: $effortMax
        ) {
          owner
          New
          Assigned
          Fixed
          Closed
        }
      }
    `;
    const data = await graphQLFetch(query, vars, showError);

    return data;
  }

  constructor() {
    super();

    const stats = store.initialData ? store.initialData.issueCounts : null;
    delete store.initialData;

    this.state = {
      stats,
    };
  }

  componentDidMount() {
    const { stats } = this.state;

    if (stats == null) this.loadData();
  }

  componentDidUpdate(prevProps) {
    const {
      location: { search: prevSearch },
    } = prevProps;
    const {
      location: { search: currentSearch },
    } = this.props;

    if (prevSearch !== currentSearch) this.loadData();
  }

  async loadData() {
    const {
      match,
      location: { search },
      showError,
    } = this.props;

    const data = await IssueReport.fetchData(match, search, showError);
    if (data) {
      this.setState({ stats: data.issueCounts });
    }
  }

  render() {
    const { stats } = this.state;
    if (stats == null) return null;

    const headerColumns = statuses.map(status => (
      <th key={status}>{status}</th>
    ));

    const statRows = stats.map(counts => (
      <tr key={counts.owner}>
        <td>{counts.owner}</td>

        {statuses.map(status => (
          <td key={status}>{counts[status]}</td>
        ))}

        {/* Row total calculation. */}
        <td>
          {Object.keys(counts).reduce((acc, key) => {
            if (key === 'owner') return acc;

            const newTotal = acc + counts[key];
            return newTotal;
          }, 0)}
        </td>
      </tr>
    ));

    // Column total calculation.
    const colTotalsInitObject = statuses.reduce(
      (acc, status) => ({ ...acc, [status]: 0 }),
      {}
    );

    const colTotals = stats.reduce((acc, counts) => {
      const newTotal = { ...acc };
      statuses.forEach(status => {
        const value = counts[status] == null ? 0 : counts[status];
        newTotal[status] += value;
      });
      return newTotal;
    }, colTotalsInitObject);

    const totalCol = statuses.map(status => (
      <td key={status}>{colTotals[status]}</td>
    ));

    const {
      location: { search },
    } = this.props;
    const hasFilter = search !== '';

    return (
      <>
        <Panel defaultExpanded={hasFilter}>
          <Panel.Heading>
            <Panel.Title toggle>Filter</Panel.Title>
          </Panel.Heading>

          <Panel.Body collapsible>
            <IssueFilter urlBase="/report" />
          </Panel.Body>
        </Panel>

        <Table hover responsive bordered condensed>
          <thead>
            <tr>
              <th />
              {headerColumns}
              <th>Total</th>
            </tr>
          </thead>

          <tbody>
            {statRows}
            <tr>
              <td>
                <strong>Total</strong>
              </td>
              {totalCol}
            </tr>
          </tbody>
        </Table>
      </>
    );
  }
}

const IssueReportWithToast = withToast(IssueReport);
IssueReportWithToast.fetchData = IssueReport.fetchData;

export default IssueReportWithToast;
