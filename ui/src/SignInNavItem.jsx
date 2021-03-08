import React, { Component } from 'react';
import { NavItem, NavDropdown, MenuItem, Modal, Button } from 'react-bootstrap';

export default class SignInNavItem extends Component {
  constructor() {
    super();
    this.state = {
      showing: false,
      user: { givenName: '', signedIn: false },
    };

    this.signIn = this.signIn.bind(this);
    this.signOut = this.signOut.bind(this);
    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
  }

  signIn() {
    this.hideModal();
    this.setState({ user: { givenName: 'User1', signedIn: true } });
  }

  signOut() {
    this.setState({ user: { givenName: '', signedIn: false } });
  }

  showModal() {
    this.setState({ showing: true });
  }

  hideModal() {
    this.setState({ showing: false });
  }

  render() {
    const {
      showing,
      user: { givenName, signedIn },
    } = this.state;

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
            <Button block bsStyle="primary" onClick={this.signIn}>
              Sign in
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
