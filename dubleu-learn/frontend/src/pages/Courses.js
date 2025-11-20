import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Courses.css';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/api/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    if (filter === 'all') return true;
    if (filter === 'my-courses') {
      return course.students.some(student => student._id === user.id);
    }
    if (filter === 'teaching') {
      return course.teacher._id === user.id;
    }
    return course.subject === filter;
  });

  if (loading) {
    return <div className="loading">Loading courses...</div>;
  }

  return (
    <div className="courses-page">
      <div className="courses-header">
        <h1>Course Catalog</h1>
        {(user.role === 'teacher' || user.role === 'admin') && (
          <Link to="/create-course" className="create-course-btn">
            Create New Course
          </Link>
        )}
      </div>

      <div className="courses-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Courses
        </button>
        <button 
          className={`filter-btn ${filter === 'my-courses' ? 'active' : ''}`}
          onClick={() => setFilter('my-courses')}
        >
          My Courses
        </button>
        {user.role === 'teacher' && (
          <button 
            className={`filter-btn ${filter === 'teaching' ? 'active' : ''}`}
            onClick={() => setFilter('teaching')}
          >
            Teaching
          </button>
        )}
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          className="subject-filter"
        >
          <option value="all">All Subjects</option>
          <option value="math">Mathematics</option>
          <option value="science">Science</option>
          <option value="english">English</option>
          <option value="history">History</option>
          <option value="art">Art</option>
          <option value="music">Music</option>
          <option value="pe">Physical Education</option>
          <option value="technology">Technology</option>
        </select>
      </div>

      <div className="courses-grid">
        {filteredCourses.map(course => (
          <div key={course._id} className="course-card">
            <div className="course-header">
              <h3>{course.title}</h3>
              <span className={`course-status ${course.status}`}>
                {course.status}
              </span>
            </div>
            <p className="course-description">{course.description}</p>
            <div className="course-meta">
              <span className="course-subject">{course.subject}</span>
              <span className="course-teacher">
                Teacher: {course.teacher.profile.firstName} {course.teacher.profile.lastName}
              </span>
              <span className="course-students">
                {course.students.length} students enrolled
              </span>
            </div>
           <div className="course-actions">
  <Link to={`/courses/${course._id}`} className="view-course-btn">
    View Course
  </Link>
  {user.role === 'student' && !course.students.some(s => s._id === user.id) && (
    <button 
      className="enroll-btn"
      onClick={async () => {
        console.log('🎯 Enroll button clicked in course list');
        try {
          const response = await api.post(`/api/courses/${course._id}/enroll`);
          console.log('✅ Enrollment successful:', response.data);
          alert('Successfully enrolled!');
          // Refresh the courses to update the UI
          fetchCourses();
        } catch (error) {
          console.error('❌ Enrollment failed:', error);
          alert(error.response?.data?.message || 'Enrollment failed');
        }
      }}
    >
      Enroll
    </button>
  )}
</div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="no-courses">
          <p>No courses found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default Courses;