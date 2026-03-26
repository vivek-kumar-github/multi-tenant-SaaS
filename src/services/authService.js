const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const jwtSecret = process.env.JWT_SECRET || 'super-secret-dev-key';
const jwtExpiresIn = '1h';

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

const generateToken = ({ userId, email, role, tenantId }) => {
  return jwt.sign({ userId, email, role, tenantId }, jwtSecret, { expiresIn: jwtExpiresIn });
};

module.exports = { hashPassword, comparePassword, generateToken };