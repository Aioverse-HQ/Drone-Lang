'use strict';

const express = require('express');
const authRouter = require('./routes/auth');

function createApp() {
  const app = express();

  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.use('/api/auth', authRouter);

  return app;
}

module.exports = { createApp };
