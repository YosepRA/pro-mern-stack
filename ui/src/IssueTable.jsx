import React from 'react';
import { Link, NavLink, withRouter } from 'react-router-dom';
import { Button, Glyphicon, Tooltip, OverlayTrigger } from 'react-bootstrap';

const IssueRow = withRouter(
  ({ issue, location: { search }, index, closeIssue, deleteIssue }) => {
    const selectLocation = {
      pathname: `/issues/${issue.id}`,
      search,
    };
    const closeTooltip = <Tooltip id="tooltip">Close issue</Tooltip>;
    const deleteTooltip = <Tooltip id="tooltip">Delete issue</Tooltip>;

    return (
      <tr>
        <td>{issue.id}</td>
        <td>{issue.status}</td>
        <td>{issue.owner}</td>
        <td>{issue.created.toDateString()}</td>
        <td>{issue.effort}</td>
        <td>{issue.due ? issue.due.toDateString() : ''}</td>
        <td>{issue.title}</td>
        <td>
          <Link to={`/edit/${issue.id}`}>Edit</Link>
          {' | '}
          <NavLink to={selectLocation}>Details</NavLink>
          {' | '}
          <OverlayTrigger
            delayShow={1000}
            overlay={closeTooltip}
            placement="top"
          >
            <Button bsSize="xsmall" onClick={() => closeIssue(index)}>
              <Glyphicon glyph="remove" />
            </Button>
          </OverlayTrigger>
          {' | '}
          <OverlayTrigger
            delayShow={1000}
            overlay={deleteTooltip}
            placement="top"
          >
            <Button bsSize="xsmall" onClick={() => deleteIssue(index)}>
              <Glyphicon glyph="trash" />
            </Button>
          </OverlayTrigger>
        </td>
      </tr>
    );
  }
);

export default function IssueTable({ issues, closeIssue, deleteIssue }) {
  const issueRows = issues.map((issue, index) => (
    <IssueRow
      key={issue.id}
      issue={issue}
      index={index}
      closeIssue={closeIssue}
      deleteIssue={deleteIssue}
    />
  ));

  return (
    <table className="bordered-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Status</th>
          <th>Owner</th>
          <th>Created</th>
          <th>Effort</th>
          <th>Due Date</th>
          <th>Title</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>{issueRows}</tbody>
    </table>
  );
}
