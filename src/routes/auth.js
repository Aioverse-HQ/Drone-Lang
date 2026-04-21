'use strict';

const { Router } = require('express');
const { rateLimit } = require('express-rate-limit');
const { register, login } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'too many requests, please try again later' },
  skip: () => process.env.NODE_ENV === 'test',
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'too many requests, please try again later' },
  skip: () => process.env.NODE_ENV === 'test',
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

router.get('/me', apiLimiter, authenticate, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
