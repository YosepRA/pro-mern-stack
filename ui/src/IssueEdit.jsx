import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import graphQLFetch from './graphQLFetch.js';

export default class IssueEdit extends Component {
  constructor() {
    super();
    this.state = {
      issue: {},
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }

  componentDidUpdate(prevProps) {
    const {
      match: {
        params: { id },
      },
    } = this.props;
    const {
      match: {
        params: { id: prevID },
      },
    } = prevProps;

    if (id !== prevID) this.loadData();
  }

  handleChange({ target: { name, value } }) {
    this.setState(prevState => ({
      issue: {
        ...prevState.issue,
        [name]: value,
      },
    }));
  }

  handleSubmit(event) {
    event.preventDefault();
    const { issue } = this.state;
    console.log(issue);
  }

  async loadData() {
    const query = `
      query issue($id: Int!) {
        issue(id: $id) {
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

    const {
      match: {
        params: { id },
      },
    } = this.props;

    const data = await graphQLFetch(query, { id });

    if (data) {
      const { issue } = data;

      issue.due = issue.due ? issue.due.toDateString() : '';
      issue.effort = issue.effort != null ? issue.effort.toString() : '';
      issue.owner = issue.owner != null ? issue.owner : '';
      issue.description = issue.description != null ? issue.description : '';

      this.setState({ issue });
    } else {
      this.setState({ issue: {} });
    }
  }

  render() {
    const {
      issue: { id },
    } = this.state;
    const {
      match: {
        params: { id: propsID },
      },
    } = this.props;
    // Checking for non-existent data.
    if (id == null) {
      if (propsID != null) {
        return <h3>{`Issue with ID ${propsID} not found.`}</h3>;
      }
      return null;
    }

    const {
      issue: { title, status, owner, effort, description, created, due },
    } = this.state;

    return (
      <form onSubmit={this.handleSubmit}>
        <h3>{`Editing issue: ${id}`}</h3>

        <table>
          <tbody>
            <tr>
              <td>Created:</td>
              <td>{created.toDateString()}</td>
            </tr>

            <tr>
              <td>Status:</td>
              <td>
                <select
                  name="status"
                  id="status"
                  value={status}
                  onChange={this.handleChange}
                >
                  <option value="New">New</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Fixed">Fixed</option>
                  <option value="Closed">Closed</option>
                </select>
              </td>
            </tr>

            <tr>
              <td>Owner:</td>
              <td>
                <input
                  type="text"
                  name="owner"
                  value={owner}
                  onChange={this.handleChange}
                />
              </td>
            </tr>

            <tr>
              <td>Effort:</td>
              <td>
                <input
                  type="text"
                  name="effort"
                  value={effort}
                  onChange={this.handleChange}
                />
              </td>
            </tr>

            <tr>
              <td>Due:</td>
              <td>
                <input
                  type="text"
                  name="due"
                  value={due}
                  onChange={this.handleChange}
                />
              </td>
            </tr>

            <tr>
              <td>Title:</td>
              <td>
                <input
                  type="text"
                  name="title"
                  value={title}
                  onChange={this.handleChange}
                  size={50}
                />
              </td>
            </tr>

            <tr>
              <td>Description</td>
              <td>
                <textarea
                  cols="50"
                  rows="8"
                  name="description"
                  value={description}
                  onChange={this.handleChange}
                />
              </td>
            </tr>

            <tr>
              <td />
              <td>
                <button type="submit">Submit</button>
              </td>
            </tr>
          </tbody>
        </table>

        <Link to={`/edit/${id - 1}`}>Prev</Link>
        {' | '}
        <Link to={`/edit/${id + 1}`}>Next</Link>
      </form>
    );
  }
}
