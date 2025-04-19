import User from '../models/User.js';

export const getUsers = async (req, res) => {
  try {
    const users = await User.find(); // Get all fields for all users
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
