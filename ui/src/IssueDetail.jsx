import React, { Component } from 'react';

export default function IssueDetail({ issue }) {
  if (issue) {
    return (
      <div>
        <h3>Issue Details</h3>
        <pre>{issue.description}</pre>
      </div>
    );
  }

  return null;
}
