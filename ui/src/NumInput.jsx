import React, { Component } from 'react';

function format(num) {
  return num != null ? num.toString() : '';
}

function unformat(str) {
  const value = parseInt(str, 10);
  return Number.isNaN(value) ? null : value;
}

export default class NumInput extends Component {
  constructor({ value }) {
    super();
    this.state = {
      value: format(value),
    };

    this.onChange = this.onChange.bind(this);
    this.onBlur = this.onBlur.bind(this);
  }

  onChange({ target: { value } }) {
    if (value.match(/^\d*$/)) {
      this.setState({ value });
    }
  }

  onBlur(event) {
    const { onChange } = this.props;
    const { value } = this.state;

    onChange(event, unformat(value));
  }

  render() {
    const { value } = this.state;

    return (
      <input
        type="text"
        {...this.props}
        value={value}
        onChange={this.onChange}
        onBlur={this.onBlur}
      />
    );
  }
}
