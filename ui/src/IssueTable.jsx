import React from 'react';
import { withRouter } from 'react-router-dom';
import {
  Button,
  Glyphicon,
  Tooltip,
  OverlayTrigger,
  Table,
} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

const IssueRow = withRouter(
  ({ issue, location: { search }, index, closeIssue, deleteIssue }) => {
    const selectLocation = {
      pathname: `/issues/${issue.id}`,
      search,
    };
    const editTooltip = <Tooltip id="edit-tooltip">Edit issue</Tooltip>;
    const closeTooltip = <Tooltip id="close-tooltip">Close issue</Tooltip>;
    const deleteTooltip = <Tooltip id="delete-tooltip">Delete issue</Tooltip>;

    function onClose(event) {
      event.preventDefault();
      closeIssue(index);
    }

    function onDelete(event) {
      event.preventDefault();
      deleteIssue(index);
    }

    const tableRow = (
      <tr>
        <td>{issue.id}</td>
        <td>{issue.status}</td>
        <td>{issue.owner}</td>
        <td>{issue.created.toDateString()}</td>
        <td>{issue.effort}</td>
        <td>{issue.due ? issue.due.toDateString() : ''}</td>
        <td>{issue.title}</td>
        <td>
          <LinkContainer to={`/edit/${issue.id}`}>
            <OverlayTrigger
              delayShow={1000}
              overlay={editTooltip}
              placement="top"
            >
              <Button bsSize="xsmall">
                <Glyphicon glyph="edit" />
              </Button>
            </OverlayTrigger>
          </LinkContainer>
          {' | '}
          <OverlayTrigger
            delayShow={1000}
            overlay={closeTooltip}
            placement="top"
          >
            <Button bsSize="xsmall" onClick={onClose}>
              <Glyphicon glyph="remove" />
            </Button>
          </OverlayTrigger>
          {' | '}
          <OverlayTrigger
            delayShow={1000}
            overlay={deleteTooltip}
            placement="top"
          >
            <Button bsSize="xsmall" onClick={onDelete}>
              <Glyphicon glyph="trash" />
            </Button>
          </OverlayTrigger>
        </td>
      </tr>
    );

    return <LinkContainer to={selectLocation}>{tableRow}</LinkContainer>;
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
    <Table bordered hover condensed responsive>
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
    </Table>
  );
}
