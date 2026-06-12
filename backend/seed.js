const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding...');

    // Check if Super Admin already exists
    const adminExists = await User.findOne({ email: 'superadmin@university.edu' });
    if (adminExists) {
      console.log('Super Admin already exists. Exiting...');
      process.exit();
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin@123', salt);

    // Create Super Admin
    await User.create({
      name: 'System Super Admin',
      email: 'superadmin@university.edu',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      status: true
    });

    console.log('Super Admin created successfully!');
    console.log('Email: superadmin@university.edu');
    console.log('Password: Admin@123');
    process.exit();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedSuperAdmin();