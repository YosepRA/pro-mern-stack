/* eslint-disable react/prefer-stateless-function */

import React from 'react';
import { withRouter } from 'react-router-dom';
import URLSearchParams from 'url-search-params';
import {
  ButtonToolbar,
  Button,
  FormGroup,
  FormControl,
  ControlLabel,
  InputGroup,
} from 'react-bootstrap';

class IssueFilter extends React.Component {
  constructor({ location: { search } }) {
    super();

    const params = new URLSearchParams(search);
    this.state = {
      status: params.get('status') || '',
      effortMin: params.get('effortMin') || '',
      effortMax: params.get('effortMax') || '',
      changed: false,
    };

    this.onChangeStatus = this.onChangeStatus.bind(this);
    this.onChangeEffortMin = this.onChangeEffortMin.bind(this);
    this.onChangeEffortMax = this.onChangeEffortMax.bind(this);
    this.applyFilter = this.applyFilter.bind(this);
    this.showOriginalFilter = this.showOriginalFilter.bind(this);
  }

  componentDidUpdate(prevProps) {
    const {
      location: { search: prevSearch },
    } = prevProps;
    const {
      location: { search: currentSearch },
    } = this.props;

    if (prevSearch !== currentSearch) this.showOriginalFilter();
  }

  onChangeStatus({ target: { value } }) {
    this.setState({ status: value, changed: true });
  }

  onChangeEffortMin({ target: { value: effortValue } }) {
    if (effortValue.match(/^\d*$/)) {
      this.setState({ effortMin: effortValue, changed: true });
    }
  }

  onChangeEffortMax({ target: { value: effortValue } }) {
    if (effortValue.match(/^\d*$/)) {
      this.setState({ effortMax: effortValue, changed: true });
    }
  }

  showOriginalFilter() {
    const {
      location: { search },
    } = this.props;
    const params = new URLSearchParams(search);

    this.setState({
      status: params.get('status') || '',
      effortMin: params.get('effortMin') || '',
      effortMax: params.get('effortMax') || '',
      changed: false,
    });
  }

  applyFilter() {
    const { history } = this.props;
    const { status, effortMin, effortMax } = this.state;

    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (effortMin) params.set('effortMin', effortMin);
    if (effortMax) params.set('effortMax', effortMax);

    const search = params.toString() ? `?${params.toString()}` : '';
    history.push({
      pathname: '/issues',
      search,
    });
  }

  render() {
    const { status, effortMin, effortMax, changed } = this.state;

    return (
      <div>
        <FormGroup>
          <ControlLabel>Status:</ControlLabel>

          <FormControl
            componentClass="select"
            onChange={this.onChangeStatus}
            value={status}
          >
            <option value="">All</option>
            <option value="New">New</option>
            <option value="Assigned">Assigned</option>
            <option value="Fixed">Fixed</option>
            <option value="Closed">Closed</option>
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel>Effort between:</ControlLabel>

          <InputGroup>
            <FormControl
              type="text"
              size={5}
              value={effortMin}
              onChange={this.onChangeEffortMin}
            />
            <InputGroup.Addon>-</InputGroup.Addon>
            <FormControl
              type="text"
              size={5}
              value={effortMax}
              onChange={this.onChangeEffortMax}
            />
          </InputGroup>
        </FormGroup>

        <ButtonToolbar>
          <Button bsStyle="primary" onClick={this.applyFilter}>
            Apply
          </Button>
          <Button onClick={this.showOriginalFilter} disabled={!changed}>
            Reset
          </Button>
        </ButtonToolbar>
      </div>
    );
  }
}

export default withRouter(IssueFilter);
