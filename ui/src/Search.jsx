import React, { Component } from 'react';
import SelectAsync from 'react-select/lib/Async.js';
import { withRouter } from 'react-router-dom';

import graphQLFetch from './graphQLFetch.js';
import withToast from './withToast.jsx';

class Search extends Component {
  constructor() {
    super();

    this.loadOptions = this.loadOptions.bind(this);
    this.onChangeSelection = this.onChangeSelection.bind(this);
  }

  onChangeSelection({ value }) {
    const { history } = this.props;
    history.push(`/edit/${value}`);
  }

  async loadOptions(term) {
    // Search when the length is at least 3 characters long.
    if (term.length < 3) return [];

    const { showError } = this.props;
    const query = `
      query issueList($search: String) {
        issueList(search: $search) {
          issues {
            id
            title
          }
        }
      }
    `;

    const data = await graphQLFetch(query, { search: term }, showError);

    return data.issueList.issues.map(({ id, title }) => ({
      label: `#${id}: ${title}`,
      value: id,
    }));
  }

  render() {
    return (
      <SelectAsync
        instanceId="search-select"
        value=""
        loadOptions={this.loadOptions}
        filterOptions={() => true}
        onChange={this.onChangeSelection}
        components={{ DropdownIndicator: null }}
      />
    );
  }
}

export default withRouter(withToast(Search));
