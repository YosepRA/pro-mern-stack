import React, { Component } from 'react';
import {
  Navbar,
  Nav,
  NavItem,
  NavDropdown,
  MenuItem,
  Glyphicon,
  Grid,
  Col,
} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import Contents from './Contents.jsx';
import graphQLFetch from './graphQLFetch.js';
import IssueAddNavItem from './IssueAddNavItem.jsx';
import Search from './Search.jsx';
import SignInNavItem from './SignInNavItem.jsx';
import UserContext from './UserContext.js';
import store from './store.js';

function NavBar({ user, onUserChange }) {
  return (
    <Navbar>
      <Navbar.Header>
        <Navbar.Brand>Issue Tracker</Navbar.Brand>
      </Navbar.Header>

      <Nav>
        <LinkContainer exact to="/">
          <NavItem>Home</NavItem>
        </LinkContainer>
        <LinkContainer to="/issues">
          <NavItem>List</NavItem>
        </LinkContainer>
        <LinkContainer to="/report">
          <NavItem>Report</NavItem>
        </LinkContainer>
        <LinkContainer to="/about">
          <NavItem>About</NavItem>
        </LinkContainer>
      </Nav>

      <Col sm={5}>
        <Navbar.Form>
          <Search />
        </Navbar.Form>
      </Col>

      <Nav pullRight>
        <IssueAddNavItem user={user} />

        <SignInNavItem user={user} onUserChange={onUserChange} />

        <NavDropdown
          id="user-dropdown"
          title={<Glyphicon glyph="option-vertical" />}
          noCaret
        >
          <MenuItem>About</MenuItem>
        </NavDropdown>
      </Nav>
    </Navbar>
  );
}

function Footer() {
  return (
    <small>
      <hr />
      <p className="text-center">
        Full source code available at this{' '}
        <a href="https://github.com/YosepRA/pro-mern-stack">
          GitHub repository.
        </a>
      </p>
    </small>
  );
}

class Page extends Component {
  static async fetchData(cookie) {
    const query = `query {
      user {
        signedIn
        givenName
      }
    }`;
    const data = await graphQLFetch(query, null, null, cookie);

    return data;
  }

  constructor() {
    super();

    const user = store.userData ? store.userData.user : null;
    delete store.userData;

    this.state = { user };

    this.onUserChange = this.onUserChange.bind(this);
  }

  async componentDidMount() {
    const { user } = this.state;

    if (user == null) {
      const data = await Page.fetchData();
      this.setState({ user: data.user });
    }
  }

  onUserChange(user) {
    this.setState({ user });
  }

  render() {
    const { user } = this.state;
    if (user == null) return null;

    return (
      <div>
        <NavBar user={user} onUserChange={this.onUserChange} />
        <Grid fluid>
          <UserContext.Provider value={user}>
            <Contents />
          </UserContext.Provider>
        </Grid>
        <Footer />
      </div>
    );
  }
}

export default Page;
