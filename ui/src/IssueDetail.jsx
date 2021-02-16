import React, { Component } from 'react';

import graphQLFetch from './graphQLFetch.js';
import Toast from './Toast.jsx';

export default class IssueDetail extends Component {
  constructor() {
    super();
    this.state = {
      issue: {},
      toastVisible: false,
      toastMessage: '',
      toastType: 'info',
    };

    this.showError = this.showError.bind(this);
    this.dismissToast = this.dismissToast.bind(this);
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

    const data = await graphQLFetch(query, { id }, this.showError);

    if (data) {
      this.setState({ issue: data.issue });
    } else {
      this.setState({ issue: {} });
    }
  }

  showError(message) {
    this.setState({
      toastVisible: true,
      toastMessage: message,
      toastType: 'danger',
    });
  }

  dismissToast() {
    this.setState({ toastVisible: false });
  }

  render() {
    const {
      issue: { description },
      toastVisible,
      toastMessage,
      toastType,
    } = this.state;

    return (
      <div>
        <h3>Issue Details</h3>
        <pre>{description}</pre>

        <Toast
          showing={toastVisible}
          onDismiss={this.dismissToast}
          bsStyle={toastType}
        >
          {toastMessage}
        </Toast>
      </div>
    );
  }
}
