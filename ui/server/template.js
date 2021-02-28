export default function template(body, data) {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Pro MERN Stack</title>

        <link rel="stylesheet" href="/bootstrap/css/bootstrap.min.css" />
        <style>
          table.table-hover tr {
            cursor: pointer;
          }

          .panel-title a {
            display: block;
            width: 100%;
            cursor: pointer;
          }
        </style>
      </head>
      <body>
        <div id="content">${body}</div>

        <script>window.__INITIAL_DATA__ = ${JSON.stringify(data)}</script>
        <script src="/env.js"></script>
        <script src="/vendor.bundle.js"></script>
        <script src="/app.bundle.js"></script>
      </body>
    </html>
  `;
}
