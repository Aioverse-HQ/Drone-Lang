# Drone-Lang

Drone-Lang — a platform for writing and sharing drone programs.

## Getting Started

```bash
npm install
npm start          # starts the server on port 3000
npm test           # runs the test suite
```

## API

### `POST /api/auth/register`

Register a new user account.

**Request body**

| Field      | Type   | Required | Notes                                         |
|------------|--------|----------|-----------------------------------------------|
| `username` | string | ✔        | 3–30 characters; letters, numbers, underscores |
| `email`    | string | ✔        | valid e-mail address                          |
| `password` | string | ✔        | minimum 8 characters                         |

**Response `201 Created`**

```json
{
  "message": "user registered successfully",
  "token": "<jwt>",
  "user": { "id": 1, "username": "alice", "email": "alice@example.com", "createdAt": "..." }
}
```

### `POST /api/auth/login`

Authenticate with an existing account.

**Request body**

| Field      | Type   | Required |
|------------|--------|----------|
| `email`    | string | ✔        |
| `password` | string | ✔        |

**Response `200 OK`**

```json
{
  "message": "login successful",
  "token": "<jwt>",
  "user": { "id": 1, "username": "alice", "email": "alice@example.com", "createdAt": "..." }
}
```

### `GET /api/auth/me`

Return the currently authenticated user.  Requires `Authorization: Bearer <token>`.

**Response `200 OK`**

```json
{
  "user": { "id": 1, "username": "alice", "email": "alice@example.com" }
}
```

### `GET /health`

Health check.

**Response `200 OK`**

```json
{ "status": "ok" }
```

## Environment Variables

| Variable          | Default                    | Description                  |
|-------------------|----------------------------|------------------------------|
| `PORT`            | `3000`                     | HTTP port the server listens on |
| `JWT_SECRET`      | `drone-lang-dev-secret`    | Secret key for JWT signing (set a strong value in production) |
| `JWT_EXPIRES_IN`  | `24h`                      | JWT token lifetime           |
