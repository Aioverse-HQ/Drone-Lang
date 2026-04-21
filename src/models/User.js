'use strict';

const users = [];
let nextId = 1;

const User = {
  create({ username, email, passwordHash }) {
    const user = {
      id: nextId++,
      username,
      email,
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    return user;
  },

  findByEmail(email) {
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  findByUsername(username) {
    return users.find((u) => u.username.toLowerCase() === username.toLowerCase()) || null;
  },

  findById(id) {
    return users.find((u) => u.id === id) || null;
  },

  _reset() {
    users.length = 0;
    nextId = 1;
  },
};

module.exports = User;
