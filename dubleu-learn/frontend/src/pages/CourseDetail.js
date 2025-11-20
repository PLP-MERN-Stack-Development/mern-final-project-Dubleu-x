import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './CourseDetail.css';

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const fetchCourseData = async () => {
    try {
      const [courseResponse, lessonsResponse, assignmentsResponse] = await Promise.all([
        api.get(`/api/courses/${id}`),
        api.get(`/api/lessons/course/${id}`),
        api.get(`/api/assignments/course/${id}`)
      ]);

      setCourse(courseResponse.data);
      setLessons(lessonsResponse.data);
      setAssignments(assignmentsResponse.data);
    } catch (error) {
      console.error('Error fetching course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      await api.post(`/api/courses/${id}/enroll`);
      // Refresh course data to show updated enrollment
      fetchCourseData();
    } catch (error) {
      console.error('Error enrolling in course:', error);
      alert('Failed to enroll in course');
    }
  };

  if (loading) {
    return <div className="loading">Loading course...</div>;
  }

  if (!course) {
    return <div className="error">Course not found</div>;
  }

  // Enhanced teacher and enrollment checks with debug logging
  const isEnrolled = course.students.some(student => {
    const enrolled = student._id === user.id || student._id?.toString() === user.id?.toString();
    return enrolled;
  });
  
  const isTeacher = course.teacher._id === user.id || 
                   course.teacher._id?.toString() === user.id?.toString() || 
                   user.role === 'admin';

  // DEBUG LOGGING - Check the browser console for this output
  console.log('🔍 DEBUG COURSE DETAIL:');
  console.log('Course:', course);
  console.log('Course Teacher ID:', course?.teacher?._id, 'Type:', typeof course?.teacher?._id);
  console.log('Current User ID:', user?.id, 'Type:', typeof user?.id);
  console.log('User Role:', user?.role);
  console.log('Is Teacher Calculation:', {
    teacherId: course?.teacher?._id,
    userId: user?.id,
    directMatch: course?.teacher?._id === user?.id,
    stringMatch: course?.teacher?._id?.toString() === user?.id?.toString(),
    isAdmin: user?.role === 'admin',
    finalResult: isTeacher
  });
  console.log('Is Enrolled:', isEnrolled);
  console.log('User Object:', user);
  console.log('Lessons count:', lessons.length);
  console.log('Assignments count:', assignments.length);

  return (
    <div className="course-detail">
      <div className="course-hero">
        <div className="course-info">
          <h1>{course.title}</h1>
          <p className="course-description">{course.description}</p>
          <div className="course-meta">
            <span className="teacher">
              Teacher: {course.teacher.profile.firstName} {course.teacher.profile.lastName}
            </span>
            <span className="subject">{course.subject}</span>
            <span className="students">{course.students.length} students</span>
          </div>
          {!isEnrolled && user.role === 'student' && (
            <button className="enroll-btn" onClick={handleEnroll}>
              Enroll in Course
            </button>
          )}
        </div>
      </div>

      <div className="course-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'lessons' ? 'active' : ''}`}
          onClick={() => setActiveTab('lessons')}
        >
          Lessons ({lessons.length})
        </button>
        <button 
          className={`tab ${activeTab === 'assignments' ? 'active' : ''}`}
          onClick={() => setActiveTab('assignments')}
        >
          Assignments ({assignments.length})
        </button>
        {isEnrolled && (
          <button 
            className={`tab ${activeTab === 'discussion' ? 'active' : ''}`}
            onClick={() => setActiveTab('discussion')}
          >
            Discussion
          </button>
        )}
      </div>

      <div className="course-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="syllabus">
              <h3>Course Syllabus</h3>
              <p>{course.syllabus || 'No syllabus available.'}</p>
            </div>
            <div className="objectives">
              <h3>Learning Objectives</h3>
              {course.learningObjectives && course.learningObjectives.length > 0 ? (
                <ul>
                  {course.learningObjectives.map((objective, index) => (
                    <li key={index}>{objective}</li>
                  ))}
                </ul>
              ) : (
                <p>No learning objectives specified.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'lessons' && (
          <div className="lessons-tab">
            {isTeacher && (
              <div className="teacher-actions">
                <Link to={`/courses/${id}/create-lesson`} className="create-btn">
                  + Create New Lesson
                </Link>
              </div>
            )}
            {lessons.length > 0 ? (
              lessons.map(lesson => (
                <div key={lesson._id} className="lesson-item">
                  <h4>{lesson.title}</h4>
                  <p>{lesson.content.substring(0, 150)}...</p>
                  <div className="lesson-meta">
                    <span>Duration: {lesson.duration || 'N/A'} min</span>
                    <span>Order: {lesson.order}</span>
                  </div>
                  {isEnrolled && (
                    <button className="view-lesson-btn">View Lesson</button>
                  )}
                </div>
              ))
            ) : (
              <div className="no-content">
                <p>No lessons available for this course.</p>
                {isTeacher && (
                  <p>Create the first lesson to get started!</p>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="assignments-tab">
            {isTeacher && (
              <div className="teacher-actions">
                <Link to={`/courses/${id}/create-assignment`} className="create-btn">
                  + Create New Assignment
                </Link>
              </div>
            )}
            {assignments.length > 0 ? (
              assignments.map(assignment => (
                <div key={assignment._id} className="assignment-item">
                  <div className="assignment-header">
                    <h4>{assignment.title}</h4>
                    <span className={`assignment-type ${assignment.assignmentType}`}>
                      {assignment.assignmentType}
                    </span>
                  </div>
                  <p>{assignment.description}</p>
                  <div className="assignment-meta">
                    <span className="due-date">
                      Due: {new Date(assignment.dueDate).toLocaleDateString()} at {new Date(assignment.dueDate).toLocaleTimeString()}
                    </span>
                    <span className="points">Points: {assignment.maxPoints}</span>
                    <span className="submission-type">Submissions: {assignment.allowedSubmissions}</span>
                  </div>
                  <div className="assignment-actions">
                    {isEnrolled && (
                      <button className="view-assignment-btn">Submit Assignment</button>
                    )}
                    {isTeacher && (
                      <Link 
                        to={`/assignments/${assignment._id}/submissions`} 
                        className="grade-assignment-btn"
                      >
                        Grade Submissions ({assignment.submissions ? assignment.submissions.length : 0})
                      </Link>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-content">
                <p>No assignments available for this course.</p>
                {isTeacher && (
                  <p>Create the first assignment to get started!</p>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'discussion' && isEnrolled && (
          <div className="discussion-tab">
            <div className="discussion-placeholder">
              <h3>Course Discussion</h3>
              <p>Real-time discussion feature will be implemented here.</p>
              <p>Students and teachers can communicate and ask questions.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;