const express = require('express');
const mongoose = require('mongoose'); // ADD THIS LINE
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Assignment = require('../models/Assignment');
const User = require('../models/User'); // ADD THIS LINE
const { auth, authorize } = require('../middleware/auth');
const { courseValidation } = require('../middleware/validation');
const router = express.Router();

// Get all courses
router.get('/', auth, async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('teacher', 'profile firstName lastName')
      .populate('students', 'profile firstName lastName');

    res.json(courses);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get my courses
router.get('/my-courses', auth, async (req, res) => {
  try {
    let courses;
    if (req.user.role === 'teacher') {
      courses = await Course.find({ teacher: req.user._id })
        .populate('teacher', 'profile firstName lastName')
        .populate('students', 'profile firstName lastName');
    } else if (req.user.role === 'student') {
      courses = await Course.find({ students: req.user._id })
        .populate('teacher', 'profile firstName lastName')
        .populate('students', 'profile firstName lastName');
    } else {
      courses = await Course.find()
        .populate('teacher', 'profile firstName lastName')
        .populate('students', 'profile firstName lastName');
    }

    res.json(courses);
  } catch (error) {
    console.error('Get my courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get course by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('teacher', 'profile firstName lastName email')
      .populate('students', 'profile firstName lastName email');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user has access to this course
    if (req.user.role === 'student' && !course.students.some(s => s._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied to this course' });
    }

    res.json(course);
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create course (teachers and admin only)
router.post('/', auth, authorize('teacher', 'admin'), courseValidation.create, async (req, res) => {
  try {
    const courseData = {
      ...req.body,
      teacher: req.user._id
    };

    const course = new Course(courseData);
    await course.save();

    await course.populate('teacher', 'profile firstName lastName');

    res.status(201).json(course);
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update course
router.put('/:id', auth, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is the teacher of this course or admin
    if (req.user.role !== 'admin' && course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('teacher', 'profile firstName lastName')
     .populate('students', 'profile firstName lastName');

    res.json(updatedCourse);
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Enroll in course - FIXED VERSION
router.post('/:id/enroll', auth, async (req, res) => {
  try {
    console.log('🎯 ENROLLMENT ATTEMPT ==========');
    console.log('Course ID:', req.params.id);
    console.log('User ID:', req.user._id);
    console.log('User Role:', req.user.role);

    // Validate course ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('❌ Invalid course ID format');
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      console.log('❌ Course not found in database');
      return res.status(404).json({ message: 'Course not found' });
    }

    console.log('📋 Course found:', course.title);
    console.log('👥 Current students:', course.students);

    // Check if already enrolled
    const alreadyEnrolled = course.students.some(studentId => 
      studentId.toString() === req.user._id.toString()
    );
    
    if (alreadyEnrolled) {
      console.log('ℹ️ User already enrolled in this course');
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    console.log('✅ Adding user to course students array...');
    
    // Add to course students
    course.students.push(req.user._id);
    await course.save();

    // Add course to user's enrolled courses
    console.log('👤 Updating user enrolled courses...');
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { enrolledCourses: course._id }
    });

    // Populate and get updated course
    await course.populate('teacher', 'profile firstName lastName')
                .populate('students', 'profile firstName lastName');

    console.log('🎉 ENROLLMENT SUCCESSFUL');
    console.log('Updated students count:', course.students.length);
    console.log('========================');

    res.json({ 
      success: true, // ADD THIS - frontend expects this
      message: 'Enrolled successfully', 
      course,
      enrolled: true 
    });
  } catch (error) {
    console.log('💥 ENROLLMENT ERROR ==========');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.log('========================');
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid course ID format' });
    }
    
    res.status(500).json({ 
      success: false, // ADD THIS
      message: 'Server error during enrollment' 
    });
  }
});

// Get course statistics
router.get('/:id/stats', auth, async (req, res) => {
  try {
    const courseId = req.params.id;
    
    const [lessonCount, assignmentCount, studentCount] = await Promise.all([
      Lesson.countDocuments({ courseId }),
      Assignment.countDocuments({ courseId }),
      Course.findById(courseId).select('students').then(course => course.students.length)
    ]);

    res.json({
      lessonCount,
      assignmentCount,
      studentCount
    });
  } catch (error) {
    console.error('Get course stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;