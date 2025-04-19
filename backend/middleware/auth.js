import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.error('No Authorization header provided');
      return res.status(401).json({ message: 'No Authorization header provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.error('No token provided');
      return res.status(401).json({ message: 'No token provided' });
    }

    console.log('Token received:', token); // Debugging log
    console.log('JWT_SECRET:', process.env.JWT_SECRET); // Debugging log

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use JWT_SECRET from .env
    const user = await User.findById(decoded.id);
    if (!user) {
      console.error('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Error in auth middleware:', err.message);
    res.status(401).json({ message: 'Unauthorized', error: err.message });
  }
};

export default auth;
