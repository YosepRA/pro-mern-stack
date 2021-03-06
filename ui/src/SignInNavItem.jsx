import React, { Component } from 'react';
import { NavItem, NavDropdown, MenuItem, Modal, Button } from 'react-bootstrap';

import withToast from './withToast.jsx';

class SignInNavItem extends Component {
  constructor() {
    super();
    this.state = {
      showing: false,
      disabled: true,
    };

    this.signIn = this.signIn.bind(this);
    this.signOut = this.signOut.bind(this);
    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
  }

  async componentDidMount() {
    const { showError } = this.props;
    const clientId = window.ENV.GOOGLE_CLIENT_ID;

    if (!clientId) return;

    window.gapi.load('auth2', () => {
      if (!window.gapi.auth2.getAuthInstance()) {
        window.gapi.auth2
          .init({ client_id: clientId })
          .then(() => this.setState({ disabled: false }))
          .catch(() => showError('Error on Google Auth initialization.'));
      }
    });
  }

  async signIn() {
    this.hideModal();

    const { showError, onUserChange } = this.props;
    let googleToken;

    try {
      const auth2 = window.gapi.auth2.getAuthInstance();
      const googleUser = await auth2.signIn();
      googleToken = googleUser.getAuthResponse().id_token;
    } catch (error) {
      showError(`Error authentication with Google: ${error.error}`);
    }

    try {
      const apiEndPoint = window.ENV.UI_AUTH_ENDPOINT;
      const response = await fetch(`${apiEndPoint}/signin`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ google_token: googleToken }),
      });
      const body = await response.text();
      const result = JSON.parse(body);
      const { signedIn, givenName } = result;

      onUserChange({ signedIn, givenName });
    } catch (error) {
      showError(`Error signing into the app: ${error}`);
    }
  }

  async signOut() {
    const apiEndPoint = window.ENV.UI_AUTH_ENDPOINT;
    const { showError, onUserChange } = this.props;

    try {
      await fetch(`${apiEndPoint}/signout`, {
        method: 'POST',
        credentials: 'include',
      });
      const auth2 = window.gapi.auth2.getAuthInstance();
      await auth2.signOut();

      onUserChange({ signedIn: false, givenName: '' });
    } catch (error) {
      showError(`Error signing out: ${error}`);
    }
  }

  showModal() {
    const { showError } = this.props;
    const clientId = window.ENV.GOOGLE_CLIENT_ID;

    if (!clientId) {
      showError('Missing environment variable GOOGLE_CLIENT_ID.');
      return;
    }

    this.setState({ showing: true });
  }

  hideModal() {
    this.setState({ showing: false });
  }

  render() {
    const { showing, disabled } = this.state;
    const {
      user: { givenName, signedIn },
    } = this.props;

    if (signedIn) {
      return (
        <NavDropdown title={givenName} id="user">
          <MenuItem onClick={this.signOut}>Sign out</MenuItem>
        </NavDropdown>
      );
    }

    return (
      <>
        <NavItem onClick={this.showModal}>Sign in</NavItem>

        <Modal keyboard show={showing} onHide={this.hideModal} bsSize="sm">
          <Modal.Header closeButton>
            <Modal.Title>Sign in</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Button
              block
              bsStyle="primary"
              disabled={disabled}
              onClick={this.signIn}
            >
              <img
                src="https://developers.google.com/identity/images/btn_google_signin_light_normal_web.png"
                alt="Sign in"
              />
            </Button>
          </Modal.Body>

          <Modal.Footer>
            <Button bsStyle="link" onClick={this.hideModal}>
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}

export default withToast(SignInNavItem);
