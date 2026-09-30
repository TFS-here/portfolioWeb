const jwt = require('jsonwebtoken');

const strictAuth = (req, res, next) => {
  // Check for token in header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied', message: 'No token, authorization denied', error: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid', message: 'Token is not valid (session expired). Please log in again.', error: 'Token is not valid' });
  }
};

module.exports = strictAuth;
