const User = require('../models/User');
const bcrypt = require('bcrypt');
const logAudit = require('../utils/auditLogger');

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
    await logAudit(req, 'USER_CREATION', `Created user: ${newUser.email} with role ${newUser.role}`);

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


// Update ANY user or SELF (Name, Email, Role, Password, Assigned Dean)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role, assignedDean } = req.body;

    // Find the targeted user
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Guardrail: Prevent modifying someone else's data if not a Super Admin
    if (req.user.role !== 'SUPER_ADMIN' && req.user._id.toString() !== id) {
      return res.status(403).json({ message: 'Unauthorized profile update action' });
    }

    // Guardrail: Prevent a Super Admin from accidentally changing their own role
    if (req.user._id.toString() === id && role && role !== 'SUPER_ADMIN') {
      return res.status(400).json({ message: 'You cannot revoke your own Super Admin role status' });
    }

    // 1. Update basic information if provided
    if (name) user.name = name;
    if (email) {
      // Check if email is being taken by another user account
      const emailCheck = await User.findOne({ email, _id: { $ne: id } });
      if (emailCheck) return res.status(400).json({ message: 'Email address is already in use' });
      user.email = email;
    }

    // 2. Update Role & Dean assignments dynamically
    if (role) {
      user.role = role;
      // If role is changed away from Coordinator, wipe out any residual assigned deans
      if (role !== 'COORDINATOR') {
        user.assignedDean = null;
      }
    }

    // Handle Dean Assignment/Reassignment directly inside the edit pipeline
    if (user.role === 'COORDINATOR') {
      // If explicit dean value is provided, update it. If explicitly empty string, clear it.
      user.assignedDean = assignedDean === '' ? null : assignedDean;
    }

    // 3. Handle Password update securely
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    // Log the event into our system audit stack
    await logAudit(req, 'USER_MANAGEMENT_UPDATE', `Modified user profile for ID: ${id}`);

    res.json({ 
      message: 'User profile updated successfully', 
      user: { id: user._id, name: user.name, email: user.email, role: user.role } 
    });
  } catch (error) {
    console.error('Update User Error:', error);
    res.status(500).json({ message: 'Failed to update user configurations' });
  }
};

module.exports = { getUsers, createUser, assignCoordinator, updateUser };