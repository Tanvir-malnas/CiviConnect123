import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config({ path: '.env.production' });

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('Connected to MongoDB');

    const existingAdmin = await User.findOne({
      email: 'admin@civiconnect.com',
    });

    if (existingAdmin) {
      console.log('Admin already exists.');
      await mongoose.connection.close();
      return;
    }

    await User.create({
      name: 'Municipal Admin',
      email: 'admin@civiconnect.com',
      password: 'Admin@123',
      role: 'admin',
    });

    console.log('✅ Admin created successfully!');
    console.log('Email: admin@civiconnect.com');
    console.log('Password: Admin@123');

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();