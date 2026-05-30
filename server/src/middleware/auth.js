const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const [, headerToken] = header.split(' ');
    const queryToken = typeof req.query?.token === 'string' ? req.query.token : '';
    const token = headerToken || queryToken;

    if (!token) {
      return res.status(401).json({ message: 'Missing auth token' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select('-passwordHash');

    if (!user) {
      return res.status(401).json({ message: 'Invalid auth token' });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid auth token' });
  }
};

module.exports = { authenticate };
