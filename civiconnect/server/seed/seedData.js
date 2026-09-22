import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import User from '../src/models/User.js';
import Complaint from '../src/models/Complaint.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from server directory
dotenv.config({ path: path.join(__dirname, '../.env') });

async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/civiconnect';
    console.log(`[Seed] Connecting to MongoDB: ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected successfully.');

    // Clear all complaints so the system starts completely clean with only real user data
    await Complaint.deleteMany({});
    console.log('[Seed] Cleared existing complaints.');

    // Ensure the default Admin user exists
    let adminUser = await User.findOne({ email: 'admin@civiconnect.com' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Municipal Admin',
        email: 'admin@civiconnect.com',
        password: 'Admin@123',
        role: 'admin',
      });
      console.log(`[Seed] Created Municipal Admin: admin@civiconnect.com`);
    } else {
      console.log(`[Seed] Municipal Admin already exists: admin@civiconnect.com`);
    }

    console.log('----------------------------------------------------');
    console.log('✅ DATABASE INITIALIZED WITH CLEAN REAL-DATA STATE!');
    console.log('Complaints in database: 0 (Awaiting real citizen reports)');
    console.log('Admin Account: admin@civiconnect.com / Admin@123');
    console.log('----------------------------------------------------');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
}

seedDatabase();
