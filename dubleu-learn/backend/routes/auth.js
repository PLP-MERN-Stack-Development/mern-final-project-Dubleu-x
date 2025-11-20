const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const router = express.Router();

console.log('🔐 Auth routes loaded');

// Generate JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d'
  });
};

// Add this route to your backend
router.get('/me', auth, async (req, res) => {
  try {
    // req.user should be set by your authMiddleware
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
        // Add other fields you need
      }
    });
  } catch (error) {
    console.error('Error in /me route:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    console.log('📝 REGISTRATION ATTEMPT ==========');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('JWT Secret exists:', !!process.env.JWT_SECRET);

    const { email, password, profile, role } = req.body;

    // Check if request body exists
    if (!req.body) {
      console.log('❌ No request body received');
      return res.status(400).json({ message: 'No data received' });
    }

    // Enhanced validation with specific error messages
    if (!email) {
      console.log('❌ Email missing');
      return res.status(400).json({ message: 'Email is required' });
    }
    if (!password) {
      console.log('❌ Password missing');
      return res.status(400).json({ message: 'Password is required' });
    }
    if (!profile) {
      console.log('❌ Profile missing');
      return res.status(400).json({ message: 'Profile information is required' });
    }
    if (!profile.firstName) {
      console.log('❌ First name missing');
      return res.status(400).json({ message: 'First name is required' });
    }
    if (!profile.lastName) {
      console.log('❌ Last name missing');
      return res.status(400).json({ message: 'Last name is required' });
    }
    if (password.length < 6) {
      console.log('❌ Password too short');
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    console.log('✅ All validation passed');

    // Check if user exists
    console.log('🔍 Checking if user exists...');
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    console.log('✅ No existing user found');

    // Create user
    console.log('👤 Creating new user...');
    const user = new User({
      email,
      password,
      profile,
      role: role || 'student'
    });

    console.log('💾 Saving user to database...');
    await user.save();
    console.log('✅ User saved successfully:', user.email);

    // Generate token
    console.log('🔑 Generating JWT token...');
    const token = generateToken(user._id);
    console.log('✅ Token generated');

    console.log('🎉 Registration successful for:', user.email);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });

  } catch (error) {
    console.log('💥 REGISTRATION ERROR ==========');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);
    
    if (error.name === 'ValidationError') {
      console.log('📋 Validation errors:');
      Object.values(error.errors).forEach(err => {
        console.error(`  - ${err.path}: ${err.message}`);
      });
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed',
        errors 
      });
    }
    
    if (error.code === 11000) {
      console.log('📧 Duplicate email error');
      return res.status(400).json({ message: 'Email already exists' });
    }

    // MongoDB connection error
    if (error.name === 'MongoNetworkError' || error.name === 'MongoTimeoutError') {
      console.log('🗄️ MongoDB connection error');
      return res.status(500).json({ message: 'Database connection failed' });
    }
    
    console.log('❌ Unknown error during registration');
    res.status(500).json({ 
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    console.log('🔑 LOGIN ATTEMPT ==========');
    console.log('Login attempt for:', req.body.email);

    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user exists
    console.log('🔍 Finding user...');
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    console.log('✅ User found:', user.email);

    // Check password
    console.log('🔐 Checking password...');
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('❌ Password mismatch for:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    console.log('✅ Password correct');

    // Generate token
    const token = generateToken(user._id);
    console.log('✅ Login successful for:', user.email);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('💥 LOGIN ERROR:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    console.log('👤 GET CURRENT USER for:', req.user.email);
    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        profile: req.user.profile,
        enrolledCourses: req.user.enrolledCourses
      }
    });
  } catch (error) {
    console.error('💥 GET USER ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;