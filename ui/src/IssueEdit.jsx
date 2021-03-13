import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import {
  Col,
  Panel,
  Form,
  FormGroup,
  FormControl,
  ControlLabel,
  Button,
  ButtonToolbar,
  Alert,
} from 'react-bootstrap';

import graphQLFetch from './graphQLFetch.js';
import NumInput from './NumInput.jsx';
import DateInput from './DateInput.jsx';
import TextInput from './TextInput.jsx';
import store from './store.js';
import withToast from './withToast.jsx';
import UserContext from './UserContext.js';

class IssueEdit extends Component {
  static async fetchData(match, search, showError) {
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
      params: { id },
    } = match;
    const data = await graphQLFetch(query, { id }, showError);

    return data;
  }

  constructor() {
    super();

    const issue = store.initialData ? store.initialData.issue : null;
    delete store.intiialData;

    this.state = {
      issue,
      invalidFields: {},
      showingValidation: false,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onValidityChange = this.onValidityChange.bind(this);
    this.dismissValidation = this.dismissValidation.bind(this);
  }

  componentDidMount() {
    const { issue } = this.state;
    if (issue == null) this.loadData();
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
    this.showValidation();
    const { issue, invalidFields } = this.state;
    const { showError, showSuccess } = this.props;
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
    const data = await graphQLFetch(query, { id, changes }, showError);
    if (data) {
      this.setState({ issue: data.issueUpdate });
      showSuccess('Updated issue successfully');
    }
  }

  showValidation() {
    this.setState({ showingValidation: true });
  }

  dismissValidation() {
    this.setState({ showingValidation: false });
  }

  async loadData() {
    const { match, showError } = this.props;
    const data = await IssueEdit.fetchData(match, null, showError);

    this.setState({ issue: data ? data.issue : {}, invalidFields: {} });
  }

  render() {
    const { issue } = this.state;
    if (issue == null) return null;

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
    const { invalidFields, showingValidation } = this.state;
    let validationMessage;
    if (Object.keys(invalidFields).length !== 0 && showingValidation) {
      validationMessage = (
        <Alert bsStyle="danger" onDismiss={this.dismissValidation}>
          Please correct invalid fields before submitting.
        </Alert>
      );
    }

    const {
      issue: { title, status, owner, effort, description, created, due },
      toastVisible,
      toastMessage,
      toastType,
    } = this.state;

    const { signedIn } = this.context;

    return (
      <Panel>
        <Panel.Heading>
          <Panel.Title>{`Editing issue: ${id}`}</Panel.Title>
        </Panel.Heading>

        <Panel.Body>
          <Form horizontal onSubmit={this.handleSubmit}>
            <FormGroup>
              <Col sm={3} componentClass={ControlLabel}>
                Created:
              </Col>
              <Col sm={9}>
                <FormControl.Static>
                  {created.toDateString()}
                </FormControl.Static>
              </Col>
            </FormGroup>

            <FormGroup>
              <Col sm={3} componentClass={ControlLabel}>
                Status:
              </Col>
              <Col sm={9}>
                <FormControl
                  componentClass="select"
                  name="status"
                  id="status"
                  value={status}
                  onChange={this.handleChange}
                >
                  <option value="New">New</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Fixed">Fixed</option>
                  <option value="Closed">Closed</option>
                </FormControl>
              </Col>
            </FormGroup>

            <FormGroup>
              <Col sm={3} componentClass={ControlLabel}>
                Owner:
              </Col>
              <Col sm={9}>
                <FormControl
                  componentClass={TextInput}
                  type="text"
                  name="owner"
                  value={owner}
                  onChange={this.handleChange}
                  key={id}
                />
              </Col>
            </FormGroup>

            <FormGroup>
              <Col sm={3} componentClass={ControlLabel}>
                Effort:
              </Col>
              <Col sm={9}>
                <FormControl
                  componentClass={NumInput}
                  name="effort"
                  value={effort}
                  onChange={this.handleChange}
                  key={id}
                />
              </Col>
            </FormGroup>

            <FormGroup validationState={invalidFields.due ? 'error' : null}>
              <Col sm={3} componentClass={ControlLabel}>
                Due:
              </Col>
              <Col sm={9}>
                <FormControl
                  componentClass={DateInput}
                  type="text"
                  name="due"
                  value={due}
                  onChange={this.handleChange}
                  onValidityChange={this.onValidityChange}
                  key={id}
                />
                <FormControl.Feedback />
              </Col>
            </FormGroup>

            <FormGroup>
              <Col sm={3} componentClass={ControlLabel}>
                Title:
              </Col>
              <Col sm={9}>
                <FormControl
                  componentClass={TextInput}
                  type="text"
                  name="title"
                  value={title}
                  onChange={this.handleChange}
                  size={50}
                  key={id}
                />
              </Col>
            </FormGroup>

            <FormGroup>
              <Col sm={3} componentClass={ControlLabel}>
                Description
              </Col>
              <Col sm={9}>
                <FormControl
                  componentClass={TextInput}
                  tag="textarea"
                  cols="50"
                  rows="8"
                  name="description"
                  value={description}
                  onChange={this.handleChange}
                  key={id}
                />
              </Col>
            </FormGroup>

            <FormGroup>
              <Col smOffset={3} sm={9}>
                <ButtonToolbar>
                  <Button type="submit" bsStyle="primary" disabled={!signedIn}>
                    Submit
                  </Button>
                  <LinkContainer to="/issues">
                    <Button bsStyle="link">Back</Button>
                  </LinkContainer>
                </ButtonToolbar>
              </Col>
            </FormGroup>

            <FormGroup>
              <Col smOffset={3} sm={9}>
                {validationMessage}
              </Col>
            </FormGroup>
          </Form>
        </Panel.Body>

        <Panel.Footer>
          <Link to={`/edit/${id - 1}`}>Prev</Link>
          {' | '}
          <Link to={`/edit/${id + 1}`}>Next</Link>
        </Panel.Footer>
      </Panel>
    );
  }
}

IssueEdit.contextType = UserContext;

const IssueEditWithToast = withToast(IssueEdit);
IssueEditWithToast.fetchData = IssueEdit.fetchData;

export default IssueEditWithToast;
