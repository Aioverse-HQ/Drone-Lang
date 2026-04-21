'use strict';

const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { signToken } = require('../config/jwt');

const SALT_ROUNDS = 10;

const USERNAME_RE = /^[a-zA-Z0-9_]{3,30}$/;
// Simple, linear-complexity email check: local@domain.tld
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}$/;

async function register(req, res) {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'username, email and password are required' });
  }

  if (!USERNAME_RE.test(username)) {
    return res.status(400).json({
      error: 'username must be 3-30 characters and contain only letters, numbers or underscores',
    });
  }

  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'invalid email address' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'password must be at least 8 characters' });
  }

  if (User.findByEmail(email)) {
    return res.status(409).json({ error: 'email already registered' });
  }

  if (User.findByUsername(username)) {
    return res.status(409).json({ error: 'username already taken' });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = User.create({ username, email, passwordHash });

  const token = signToken({ userId: user.id, username: user.username });

  return res.status(201).json({
    message: 'user registered successfully',
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    },
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const user = User.findByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'invalid credentials' });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({ error: 'invalid credentials' });
  }

  const token = signToken({ userId: user.id, username: user.username });

  return res.status(200).json({
    message: 'login successful',
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    },
  });
}

module.exports = { register, login };
