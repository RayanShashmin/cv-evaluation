const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Remove deprecated options - they're no longer needed in Mongoose 6+
    await mongoose.connect(process.env.DB);
    
    console.log('✅ [CV Evaluation] MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;