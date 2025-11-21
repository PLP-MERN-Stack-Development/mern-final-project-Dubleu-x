const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('🗄️ Attempting to connect to MongoDB Atlas...');
    
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dubleulearn';
    const safeURI = mongoURI.replace(/:(.*)@/, ':****@');
    console.log('MongoDB Atlas URI:', safeURI);
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Optimized for Atlas:
      serverSelectionTimeoutMS: 10000, // 10 seconds for Atlas
      socketTimeoutMS: 45000,
      maxPoolSize: 10, // Better connection pooling for Atlas
      retryWrites: true, // Enable retryable writes
      w: 'majority' // Write concern
    });
    
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🏢 Cluster: ${conn.connection.client.s.options.srvHost}`);
    
    // Connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB Atlas connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB Atlas disconnected');
    });
    
    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB Atlas reconnected');
    });
    
  } catch (error) {
    console.error('💥 MongoDB Atlas connection failed!');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    // Atlas-specific error guidance
    if (error.name === 'MongoServerSelectionError') {
      console.log('🔍 Atlas Connection Tips:');
      console.log('   1. Check if IP is whitelisted in Atlas Network Access');
      console.log('   2. Verify database user permissions in Atlas');
      console.log('   3. Check internet connection');
    }
    
    process.exit(1);
  }
};

module.exports = connectDB;