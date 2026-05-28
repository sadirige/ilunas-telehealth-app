const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, USER_ROLES } = require('../models/User');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const createToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

router.post('/register', async (req, res) => {
  const { email, password, role, displayName } = req.body || {};

  if (!email || !password || !role) {
    return res.status(400).json({ message: 'Email, password, and role are required' });
  }

  if (!USER_ROLES.includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    email: email.toLowerCase(),
    passwordHash,
    role,
    displayName: displayName || ''
  });

  const token = createToken(user);

  return res.status(201).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      displayName: user.displayName
    }
  });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = createToken(user);

  return res.status(200).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      displayName: user.displayName
    }
  });
});

router.get('/me', authenticate, async (req, res) => {
  return res.status(200).json({ user: req.user });
});

module.exports = router;
