const express = require('express');
const proxy = require('http-proxy-middleware');
const path = require('path');
// const history = require('connect-history-api-fallback');

require('dotenv').config();

const app = express();
const port = process.env.UI_SERVER_PORT || 8000;
const UI_API_ENDPOINT = process.env.UI_API_ENDPOINT || 'http://localhost:3000';
const env = { UI_API_ENDPOINT };
const apiProxyTarget = process.env.API_PROXY_TARGET;

// Webpack Hot Module Replacement configuration.
const enableHMR = (process.env.ENABLE_HMR || 'true') === 'true';
if (enableHMR && process.env.NODE_ENV !== 'production') {
  console.log('Adding dev middleware and HMR...');
  /* eslint-disable import/no-extraneous-dependencies */
  /* eslint-disable global-require */
  const webpack = require('webpack');
  const devMiddleware = require('webpack-dev-middleware');
  const hotMiddleware = require('webpack-hot-middleware');

  // Modify config.
  const config = require('./webpack.config');
  config.entry.app.push('webpack-hot-middleware/client');
  config.plugins = config.plugins || [];
  config.plugins.push(new webpack.HotModuleReplacementPlugin());

  // Add middlewares.
  const compiler = webpack(config);
  app.use(devMiddleware(compiler));
  app.use(hotMiddleware(compiler));
}

// app.use(history());
app.use(express.static('./public'));
if (apiProxyTarget) app.use('/graphql', proxy({ target: apiProxyTarget }));

app.get('/env.js', (req, res) => {
  res.send(`window.ENV = ${JSON.stringify(env)}`);
});

app.get('*', (req, res) => {
  res.sendFile(path.resolve('public/index.html'));
});

app.listen(port, () => {
  console.log(`UI Server is listening on port ${port}...`);
});
