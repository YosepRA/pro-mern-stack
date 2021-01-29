import React from 'react';

export default function IssueEdit({ match }) {
  const { id } = match.params;

  return (
    <div>
      <h1>IssueEdit placeholder for issue ID: {id}</h1>
    </div>
  );
}
