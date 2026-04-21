'use strict';

process.env.JWT_SECRET = 'test-secret-for-jest';

const request = require('supertest');
const { createApp } = require('../src/app');
const User = require('../src/models/User');

let app;

beforeEach(() => {
  User._reset();
  app = createApp();
});

describe('POST /api/auth/register', () => {
  const validPayload = {
    username: 'droneuser',
    email: 'drone@example.com',
    password: 'securepassword123',
  };

  test('registers a new user and returns a token', async () => {
    const res = await request(app).post('/api/auth/register').send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('user registered successfully');
    expect(typeof res.body.token).toBe('string');
    expect(res.body.user.username).toBe(validPayload.username);
    expect(res.body.user.email).toBe(validPayload.email);
    expect(res.body.user).not.toHaveProperty('passwordHash');
  });

  test('returns 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/auth/register').send({ username: 'only' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/);
  });

  test('returns 400 for invalid username format', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validPayload, username: 'a!' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/username/);
  });

  test('returns 400 for invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validPayload, email: 'not-an-email' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/email/);
  });

  test('returns 400 for short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validPayload, password: 'short' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/password/);
  });

  test('returns 409 when email is already registered', async () => {
    await request(app).post('/api/auth/register').send(validPayload);
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validPayload, username: 'other' });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/email/);
  });

  test('returns 409 when username is already taken', async () => {
    await request(app).post('/api/auth/register').send(validPayload);
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validPayload, email: 'other@example.com' });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/username/);
  });
});

describe('POST /api/auth/login', () => {
  const credentials = { email: 'drone@example.com', password: 'securepassword123' };

  beforeEach(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'droneuser', ...credentials });
  });

  test('returns a token for valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send(credentials);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('login successful');
    expect(typeof res.body.token).toBe('string');
    expect(res.body.user.email).toBe(credentials.email);
  });

  test('returns 400 when fields are missing', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: credentials.email });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/);
  });

  test('returns 401 for unregistered email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ghost@example.com', password: credentials.password });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('invalid credentials');
  });

  test('returns 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ ...credentials, password: 'wrongpassword' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('invalid credentials');
  });
});

describe('GET /api/auth/me', () => {
  let token;

  beforeEach(async () => {
    const res = await request(app).post('/api/auth/register').send({
      username: 'droneuser',
      email: 'drone@example.com',
      password: 'securepassword123',
    });
    token = res.body.token;
  });

  test('returns the authenticated user', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe('droneuser');
  });

  test('returns 401 without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('returns 401 with an invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalidtoken');
    expect(res.status).toBe(401);
  });
});

describe('GET /health', () => {
  test('returns ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
