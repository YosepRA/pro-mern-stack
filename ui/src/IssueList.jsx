/* eslint-disable react/jsx-no-undef */

import React from 'react';
import URLSearchParams from 'url-search-params';
import { Route } from 'react-router-dom';

import IssueFilter from './IssueFilter.jsx';
import IssueTable from './IssueTable.jsx';
import IssueAdd from './IssueAdd.jsx';
import IssueDetail from './IssueDetail.jsx';
import graphQLFetch from './graphQLFetch.js';

export default class IssueList extends React.Component {
  constructor() {
    super();
    this.state = {
      issues: [],
    };
    this.createIssue = this.createIssue.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }

  componentDidUpdate(prevProps) {
    const {
      location: { search: prevSearch },
    } = prevProps;
    const {
      location: { search },
    } = this.props;
    // Comparing previous search value with the current one, and only refresh if they're different.
    if (prevSearch !== search) this.loadData();
  }

  async loadData() {
    const {
      location: { search },
    } = this.props;

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
      query issueList(
        $status: StatusType
        $effortMin: Int
        $effortMax: Int
      ) {
        issueList(
          status: $status
          effortMin: $effortMin
          effortMax: $effortMax
        ) {
          id
          title
          status
          owner
          created
          effort
          due
        }
      }
    `;

    const data = await graphQLFetch(query, vars);
    if (data) {
      this.setState({ issues: data.issueList });
    }
  }

  async createIssue(issue) {
    const query = `
      mutation issueAdd($issue: IssueInputs!) {
        issueAdd(issue: $issue) {
          id
        }
      }
    `;

    const data = await graphQLFetch(query, { issue });

    if (data) this.loadData();
  }

  render() {
    const { issues } = this.state;
    const {
      match: { path },
    } = this.props;

    return (
      <React.Fragment>
        <h1>Issue Tracker</h1>
        <IssueFilter />
        <hr />
        <IssueTable issues={issues} />
        <hr />
        <IssueAdd createIssue={this.createIssue} />
        <hr />
        <Route path={`${path}/:id`} component={IssueDetail} />
      </React.Fragment>
    );
  }
}
