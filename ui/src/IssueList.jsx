/* eslint-disable react/jsx-no-undef */

import React from 'react';
import URLSearchParams from 'url-search-params';
import { Panel, Pagination } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import IssueFilter from './IssueFilter.jsx';
import IssueTable from './IssueTable.jsx';
import IssueDetail from './IssueDetail.jsx';
import graphQLFetch from './graphQLFetch.js';
import store from './store.js';
import withToast from './withToast.jsx';

const PAGE_SIZE = 5;

function PageLink({ params, page, activePage, children }) {
  params.set('page', page);
  if (page === 0) return React.cloneElement(children, { disabled: true });

  return (
    <LinkContainer
      isActive={() => activePage === page}
      to={{ pathname: '/issues', search: `?${params.toString()}` }}
    >
      {children}
    </LinkContainer>
  );
}

class IssueList extends React.Component {
  static async fetchData(match, search, showError) {
    const params = new URLSearchParams(search);
    const vars = {
      hasSelected: false,
      selectedId: 0,
    };
    // Status filter.
    if (params.get('status')) vars.status = params.get('status');
    // Effort range filter.
    const effortMin = parseInt(params.get('effortMin'), 10);
    if (!Number.isNaN(effortMin)) vars.effortMin = effortMin;
    const effortMax = parseInt(params.get('effortMax'), 10);
    if (!Number.isNaN(effortMax)) vars.effortMax = effortMax;
    // Page query.
    let page = parseInt(params.get('page'), 10);
    if (Number.isNaN(page)) page = 1;
    vars.page = page;

    // Issue detail query.
    const {
      params: { id },
    } = match;
    const idInt = parseInt(id, 10);
    if (!Number.isNaN(idInt)) {
      vars.hasSelected = true;
      vars.selectedId = idInt;
    }

    const query = `
      query issueList(
        $status: StatusType
        $effortMin: Int
        $effortMax: Int
        $page: Int
        $hasSelected: Boolean!
        $selectedId: Int!
      ) {
        issueList(
          status: $status
          effortMin: $effortMin
          effortMax: $effortMax
          page: $page
        ) {
          issues {
            id
            title
            status
            owner
            created
            effort
            due
          }

          pages
        }

        issue(id: $selectedId) @include (if : $hasSelected) {
          id
          description
        }
      }
    `;
    const data = await graphQLFetch(query, vars, showError);

    return data;
  }

  constructor() {
    super();

    const initialData = store.initialData || { issueList: {} };
    const {
      issueList: { issues, pages },
      issue: selectedIssue,
    } = initialData;
    delete store.initialData;

    this.state = {
      issues,
      selectedIssue,
      pages,
    };

    this.closeIssue = this.closeIssue.bind(this);
    this.deleteIssue = this.deleteIssue.bind(this);
  }

  componentDidMount() {
    const { issues } = this.state;

    if (issues == null) this.loadData();
  }

  componentDidUpdate(prevProps) {
    const {
      location: { search: prevSearch },
      match: {
        params: { id: prevId },
      },
    } = prevProps;
    const {
      location: { search },
      match: {
        params: { id },
      },
    } = this.props;
    // Comparing previous search value with the current one, and only refresh if they're different.
    if (prevSearch !== search || prevId !== id) this.loadData();
  }

  async loadData() {
    const {
      location: { search },
      match,
      showError,
    } = this.props;

    const data = await IssueList.fetchData(match, search, showError);
    if (data) {
      const {
        issueList: { issues, pages },
        issue: selectedIssue,
      } = data;

      this.setState({
        issues,
        pages,
        selectedIssue,
      });
    }
  }

  async closeIssue(index) {
    const query = `
      mutation issueClose($id: Int!) {
        issueUpdate(id: $id, changes: { status: Closed }) {
          id
          title
          status
          owner
          effort
          created
          due
          description
        }
      }
    `;
    const { issues } = this.state;
    const { showError } = this.props;
    const data = await graphQLFetch(query, { id: issues[index].id }, showError);

    if (data) {
      this.setState(prevState => {
        const newList = [...prevState.issues];
        newList[index] = data.issueUpdate;
        return { issues: newList };
      });
    } else {
      this.loadData();
    }
  }

  async deleteIssue(index) {
    const query = `
      mutation issueDelete($id: Int!) {
        issueDelete(id: $id)
      }
    `;
    const { issues } = this.state;
    const {
      location: { pathname, search },
      history,
      showSuccess,
      showError,
    } = this.props;
    const { id } = issues[index];

    const data = await graphQLFetch(query, { id }, showError);
    if (data && data.issueDelete) {
      this.setState(
        prevState => {
          if (pathname === `/issues/${id}`) {
            history.push({ pathname: '/issues', search });
          }
          return { issues: prevState.issues.filter(issue => issue.id !== id) };
        },
        () => showSuccess(`Deleted issue ${id} successfully.`)
      );
    } else {
      this.loadData();
    }
  }

  render() {
    const { issues, selectedIssue, pages } = this.state;

    if (issues == null) return null;

    const {
      location: { search },
    } = this.props;
    const hasFilter = search !== '';

    // Pagination build-up.
    const params = new URLSearchParams(search);
    let page = parseInt(params.get('page'), 10);
    if (Number.isNaN(page)) page = 1;

    const startPage = Math.floor((page - 1) / PAGE_SIZE) * PAGE_SIZE + 1;
    const endPage = startPage + PAGE_SIZE - 1;
    const prevSection = page === 1 ? 0 : startPage - PAGE_SIZE;
    const nextSection = endPage >= pages ? 0 : startPage + PAGE_SIZE;

    const items = [];
    for (let i = startPage; i <= Math.min(endPage, pages); i += 1) {
      params.set('page', i);
      items.push(
        <PageLink key={i} params={params} page={i} activePage={page}>
          <Pagination.Item>{i}</Pagination.Item>
        </PageLink>
      );
    }

    return (
      <React.Fragment>
        <Panel defaultExpanded={hasFilter}>
          <Panel.Heading>
            <Panel.Title toggle>Filter</Panel.Title>
          </Panel.Heading>

          <Panel.Body collapsible>
            <IssueFilter urlBase="/issues" />
          </Panel.Body>
        </Panel>

        <IssueTable
          issues={issues}
          closeIssue={this.closeIssue}
          deleteIssue={this.deleteIssue}
        />

        <IssueDetail issue={selectedIssue} />

        <Pagination>
          <PageLink params={params} page={prevSection}>
            <Pagination.Item>{'<'}</Pagination.Item>
          </PageLink>

          {items}

          <PageLink params={params} page={nextSection}>
            <Pagination.Item>{'>'}</Pagination.Item>
          </PageLink>
        </Pagination>
      </React.Fragment>
    );
  }
}

const IssueListWithToast = withToast(IssueList);
IssueListWithToast.fetchData = IssueList.fetchData;

export default IssueListWithToast;
