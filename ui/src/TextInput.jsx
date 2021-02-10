import React, { Component } from 'react';

function format(text) {
  return text != null ? text : '';
}

function unformat(text) {
  return text.trim().length === 0 ? null : text;
}

export default class TextInput extends Component {
  constructor({ value }) {
    super();
    this.state = {
      value: format(value),
    };

    this.onChange = this.onChange.bind(this);
    this.onBlur = this.onBlur.bind(this);
  }

  onChange({ target: { value } }) {
    this.setState({ value });
  }

  onBlur(event) {
    const { value } = this.state;
    const { onChange } = this.props;

    onChange(event, unformat(value));
  }

  render() {
    const { value } = this.state;
    const { tag = 'input', ...props } = this.props;

    return React.createElement(tag, {
      ...props,
      value,
      onBlur: this.onBlur,
      onChange: this.onChange,
    });
  }
}
