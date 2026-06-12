const User = require('../models/User');
const bcrypt = require('bcrypt');

// Get all users (Super Admin only)
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }) // Exclude self
      .populate('assignedDean', 'name')
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// Create a new user (Admin, Dean, Coordinator)
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create user' });
  }
};

// Assign Coordinator to a Dean
const assignCoordinator = async (req, res) => {
  try {
    const { coordinatorId, deanId } = req.body;
    
    // Ensure the users actually have the correct roles
    const coordinator = await User.findOne({ _id: coordinatorId, role: 'COORDINATOR' });
    const dean = await User.findOne({ _id: deanId, role: 'DEAN' });

    if (!coordinator || !dean) {
      return res.status(400).json({ message: 'Invalid Coordinator or Dean ID' });
    }

    coordinator.assignedDean = dean._id;
    await coordinator.save();

    res.json({ message: 'Coordinator successfully assigned to Dean' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to assign coordinator' });
  }
};

module.exports = { getUsers, createUser, assignCoordinator };