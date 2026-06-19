// server/scripts/migrateUsers.js
// Run this script ONCE to add role field to existing users
require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('../models/user');

const migrateUsers = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to database successfully');

    // Count users without role field
    const usersWithoutRole = await User.countDocuments({ role: { $exists: false } });
    console.log(`Found ${usersWithoutRole} users without role field`);

    if (usersWithoutRole === 0) {
      console.log('All users already have role field. No migration needed.');
      process.exit(0);
    }

    // Update all existing users to have 'recruiter' role by default
    // (assuming existing users are recruiters)
    const result = await User.updateMany(
      { role: { $exists: false } },
      { $set: { role: 'recruiter' } }
    );

    console.log(`✅ Migration completed successfully!`);
    console.log(`Updated ${result.modifiedCount} users with role: 'recruiter'`);
    
    // Verify migration
    const recruiters = await User.countDocuments({ role: 'recruiter' });
    const candidates = await User.countDocuments({ role: 'candidate' });
    
    console.log('\n📊 Final Statistics:');
    console.log(`Total Recruiters: ${recruiters}`);
    console.log(`Total Candidates: ${candidates}`);
    console.log(`Total Users: ${recruiters + candidates}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

// Run migration
migrateUsers();