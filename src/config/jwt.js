'use strict';

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

if (!JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable must be set in production');
  }
  // eslint-disable-next-line no-console
  console.warn(
    '[drone-lang] WARNING: JWT_SECRET is not set. Using an insecure default – set JWT_SECRET before deploying.',
  );
}

const secret = JWT_SECRET || 'drone-lang-dev-secret-do-not-use-in-production';

function signToken(payload) {
  return jwt.sign(payload, secret, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token) {
  return jwt.verify(token, secret);
}

module.exports = { signToken, verifyToken };
