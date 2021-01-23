let aboutMessage = 'Pretend that this is a meaningful message.';

function getMessage() {
  return aboutMessage;
}

function setMessage(_, { message }) {
  aboutMessage = message;
  return aboutMessage;
}

module.exports = { getMessage, setMessage };
