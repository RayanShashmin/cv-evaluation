const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Remove deprecated options
    await mongoose.connect(process.env.DB);
    
    console.log('✅ [Email Service] MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;