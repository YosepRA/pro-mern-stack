/* eslint-disable no-alert */

const datePattern = /^\d\d\d\d-\d\d-\d\d/;

function jsonDateReviver(key, value) {
  if (datePattern.test(value)) return new Date(value);
  return value;
}

export default async function graphQLFetch(query, variables = {}) {
  try {
    const response = await fetch(`${window.ENV.UI_API_ENDPOINT}/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    });
    const body = await response.text();
    const result = JSON.parse(body, jsonDateReviver);

    if (result.errors) {
      const error = result.errors[0];

      if (error.extensions.code === 'BAD_USER_INPUT') {
        const details = error.extensions.errors.join('\n ');
        alert(`${error.message}:\n ${details}`);
      } else {
        alert(`${error.extensions.code}: ${error.message}`);
      }
    }

    return result.data;
  } catch (error) {
    alert(`Error in sending data to server: ${error.message}`);
    return null;
  }
}