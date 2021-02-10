import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import graphQLFetch from './graphQLFetch.js';
import NumInput from './NumInput.jsx';
import DateInput from './DateInput.jsx';
import TextInput from './TextInput.jsx';

export default class IssueEdit extends Component {
  constructor() {
    super();
    this.state = {
      issue: {},
      invalidFields: {},
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onValidityChange = this.onValidityChange.bind(this);
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

  onValidityChange({ target: { name } }, valid) {
    this.setState(prevState => {
      const invalidFields = { ...prevState.invalidFields, [name]: !valid };
      if (valid) delete invalidFields[name];
      return { invalidFields };
    });
  }

  handleChange(event, naturalValue) {
    const {
      target: { name, value: textValue },
    } = event;
    const value = naturalValue === undefined ? textValue : naturalValue;

    this.setState(prevState => ({
      issue: {
        ...prevState.issue,
        [name]: value,
      },
    }));
  }

  async handleSubmit(event) {
    event.preventDefault();
    const { issue, invalidFields } = this.state;
    if (Object.keys(invalidFields).length !== 0) return;

    const query = `
      mutation issueUpdate($id: Int!, $changes: IssueUpdateInputs!) {
        issueUpdate(id: $id, changes: $changes) {
          id
          title
          owner
          status
          effort
          created
          due
          description
        }
      }
    `;
    const { id, created, ...changes } = issue;
    const data = await graphQLFetch(query, { id, changes });
    if (data) {
      this.setState({ issue: data.issueUpdate });
      // eslint-disable-next-line no-alert
      alert('Updated issue successfully');
    }
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

    this.setState({ issue: data ? data.issue : {}, invalidFields: {} });
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

    // Error message.
    const { invalidFields } = this.state;
    let validationMessage;
    if (Object.keys(invalidFields).length !== 0) {
      validationMessage = (
        <div className="error">
          Please correct invalid fields before submitting.
        </div>
      );
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
                <TextInput
                  type="text"
                  name="owner"
                  value={owner}
                  onChange={this.handleChange}
                  key={id}
                />
              </td>
            </tr>

            <tr>
              <td>Effort:</td>
              <td>
                <NumInput
                  name="effort"
                  value={effort}
                  onChange={this.handleChange}
                  key={id}
                />
              </td>
            </tr>

            <tr>
              <td>Due:</td>
              <td>
                <DateInput
                  type="text"
                  name="due"
                  value={due}
                  onChange={this.handleChange}
                  onValidityChange={this.onValidityChange}
                  key={id}
                />
              </td>
            </tr>

            <tr>
              <td>Title:</td>
              <td>
                <TextInput
                  type="text"
                  name="title"
                  value={title}
                  onChange={this.handleChange}
                  size={50}
                  key={id}
                />
              </td>
            </tr>

            <tr>
              <td>Description</td>
              <td>
                <TextInput
                  tag="textarea"
                  cols="50"
                  rows="8"
                  name="description"
                  value={description}
                  onChange={this.handleChange}
                  key={id}
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

        {validationMessage}

        <Link to={`/edit/${id - 1}`}>Prev</Link>
        {' | '}
        <Link to={`/edit/${id + 1}`}>Next</Link>
      </form>
    );
  }
}
