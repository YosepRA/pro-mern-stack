import React, { Component } from 'react';

function displayFormat(date) {
  return date != null ? date.toDateString() : '';
}

function editFormat(date) {
  return date != null ? date.toISOString().substring(0, 10) : '';
}

function unformat(str) {
  const value = new Date(str);
  return Number.isNaN(value.getTime()) ? null : value;
}

export default class DateInput extends Component {
  constructor({ value }) {
    super();
    this.state = {
      value: editFormat(value),
      focused: false,
      valid: true,
    };

    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  onFocus() {
    this.setState({ focused: true });
  }

  onBlur(event) {
    const { onChange, onValidityChange } = this.props;
    const { value, valid: oldValid } = this.state;
    const dateValue = unformat(value);
    const valid = value === '' || dateValue != null;

    if (valid !== oldValid && onValidityChange) {
      onValidityChange(event, valid);
    }

    this.setState({ focused: false, valid });

    if (valid) onChange(event, dateValue);
  }

  onChange({ target: { value } }) {
    if (value.match(/^[\d-]*$/)) {
      this.setState({ value });
    }
  }

  render() {
    const { value, focused, valid } = this.state;
    const { value: originalValue, name } = this.props;
    const className = !focused && !valid ? 'invalid' : null;
    const displayValue =
      focused || !valid ? value : displayFormat(originalValue);

    return (
      <input
        type="text"
        name={name}
        className={className}
        size={20}
        placeholder={focused ? 'yyyy-mm-dd' : null}
        value={displayValue}
        onChange={this.onChange}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
      />
    );
  }
}
