import React, { Component } from 'react';

import graphQLFetch from './graphQLFetch.js';

export default class IssueDetail extends Component {
  constructor() {
    super();
    this.state = {
      issue: {},
    };
  }

  componentDidMount() {
    this.loadData();
  }

  componentDidUpdate(prevProps) {
    const {
      match: {
        params: { id: prevID },
      },
    } = prevProps;
    const {
      match: {
        params: { id: currentID },
      },
    } = this.props;

    if (prevID !== currentID) this.loadData();
  }

  async loadData() {
    const {
      match: {
        params: { id },
      },
    } = this.props;
    const query = `query issue($id: Int!) {
      issue(id: $id) {
        id
        description
      }
    }`;

    const data = await graphQLFetch(query, { id });

    if (data) {
      this.setState({ issue: data.issue });
    } else {
      this.setState({ issue: {} });
    }
  }

  render() {
    const {
      issue: { description },
    } = this.state;

    return (
      <div>
        <h3>Issue Details</h3>
        <pre>{description}</pre>
      </div>
    );
  }
}
