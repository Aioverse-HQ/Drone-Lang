'use strict';

const User = require('../models/User');
const { verifyToken } = require('../config/jwt');

function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'missing or invalid authorization header' });
  }

  const token = authHeader.slice(7);
  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return res.status(401).json({ error: 'invalid or expired token' });
  }

  const user = User.findById(payload.userId);
  if (!user) {
    return res.status(401).json({ error: 'user not found' });
  }

  req.user = { id: user.id, username: user.username, email: user.email };
  return next();
}

module.exports = { authenticate };
