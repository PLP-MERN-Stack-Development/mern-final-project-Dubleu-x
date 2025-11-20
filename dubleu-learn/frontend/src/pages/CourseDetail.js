import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './CourseDetail.css';
import SubmissionForm from '../components/SubmissionForm';

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const fetchCourseData = async () => {
    try {
      console.log('📋 Fetching course data for ID:', id);
      
      const [courseResponse, lessonsResponse, assignmentsResponse] = await Promise.all([
        api.get(`/api/courses/${id}`),
        api.get(`/api/lessons/course/${id}`),
        api.get(`/api/assignments/course/${id}`)
      ]);

      console.log('✅ Course data fetched:', courseResponse.data);
      setCourse(courseResponse.data);
      setLessons(lessonsResponse.data);
      setAssignments(assignmentsResponse.data);
    } catch (error) {
      console.error('❌ Error fetching course data:', error);
      console.error('Error details:', error.response?.data);
      
      if (error.response?.status === 404) {
        setCourse(null); // This will trigger the "Course not found" message
      } else if (error.response?.status === 403) {
        alert('Access denied. You may need to enroll in this course first.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      console.log('🎯 Attempting enrollment...');
      console.log('Course ID:', id);
      console.log('User ID:', user.id);
      
      const response = await api.post(`/api/courses/${id}/enroll`);
      console.log('✅ Enrollment response:', response.data);
      
      // Refresh course data to show updated enrollment
      fetchCourseData();
      alert('Successfully enrolled in the course!');
    } catch (error) {
      console.error('❌ Error enrolling in course:', error);
      console.error('Error response:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to enroll in course');
    }
  };

  // UPDATED: Open submission form instead of using prompt
  const handleSubmitAssignment = (assignmentId, assignmentTitle) => {
    setSelectedAssignment({ id: assignmentId, title: assignmentTitle });
    setShowSubmissionForm(true);
  };

  const handleSubmissionSuccess = (submissionData) => {
    console.log('✅ Submission completed:', submissionData);
    // Refresh assignments to show updated status
    fetchCourseData();
  };

  if (loading) {
    return <div className="loading">Loading course...</div>;
  }

  if (!course) {
    return <div className="error">Course not found</div>;
  }

  // Enhanced teacher and enrollment checks with debug logging
  const isEnrolled = course.students.some(student => {
    const studentId = student._id || student;
    const enrolled = studentId === user.id || studentId?.toString() === user.id?.toString();
    console.log('🔍 Enrollment check:', { studentId, userId: user.id, enrolled });
    return enrolled;
  });
  
  const isTeacher = course.teacher._id === user.id || 
                   course.teacher._id?.toString() === user.id?.toString() || 
                   user.role === 'admin';

  // Comprehensive debug logging
  console.log('🔍 COMPREHENSIVE DEBUG:');
  console.log('Course ID:', course?._id);
  console.log('Course Teacher ID:', course?.teacher?._id, 'Type:', typeof course?.teacher?._id);
  console.log('Current User ID:', user?.id, 'Type:', typeof user?.id);
  console.log('User Role:', user?.role);
  console.log('Is Teacher:', isTeacher);
  console.log('Is Enrolled:', isEnrolled);
  console.log('Students in course:', course?.students?.length);
  console.log('Student IDs:', course?.students?.map(s => s._id || s));
  console.log('Current user in students:', course?.students?.some(s => 
    (s._id || s) === user.id || (s._id || s)?.toString() === user.id?.toString()
  ));
  console.log('Lessons count:', lessons.length);
  console.log('Assignments count:', assignments.length);

  // Function to render video embed
  const renderVideoEmbed = (videoUrl) => {
    if (!videoUrl) return null;
    
    // Convert YouTube watch URL to embed URL if needed
    let embedUrl = videoUrl;
    if (videoUrl.includes('youtube.com/watch')) {
      const videoId = videoUrl.split('v=')[1]?.split('&')[0];
      if (videoId) {
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
    } else if (videoUrl.includes('youtu.be/')) {
      const videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) {
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
    }
    
    return (
      <div className="video-container">
        <h5>Video Content:</h5>
        <div className="video-wrapper">
          <iframe
            src={embedUrl}
            title="Lesson Video"
            width="100%"
            height="400"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    );
  };

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
            {isEnrolled && <span className="enrolled-badge">Enrolled</span>}
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
                  
                  {/* Video Display */}
                  {renderVideoEmbed(lesson.videoUrl)}
                  
                  <p>{lesson.content.substring(0, 150)}...</p>
                  <div className="lesson-meta">
                    <span>Duration: {lesson.duration || 'N/A'} min</span>
                    <span>Order: {lesson.order}</span>
                    {lesson.videoUrl && <span className="has-video">Includes Video</span>}
                  </div>
                  {isEnrolled && (
                    <button className="view-lesson-btn">View Full Lesson</button>
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
                    {/* UPDATED: Submit Assignment button opens form modal */}
                    {isEnrolled && (
                      <button 
                        className="view-assignment-btn"
                        onClick={() => handleSubmitAssignment(assignment._id, assignment.title)}
                      >
                        Submit Assignment
                      </button>
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

      {/* ADDED: Submission Form Modal */}
      {showSubmissionForm && selectedAssignment && (
        <SubmissionForm
          assignmentId={selectedAssignment.id}
          assignmentTitle={selectedAssignment.title}
          onClose={() => {
            setShowSubmissionForm(false);
            setSelectedAssignment(null);
          }}
          onSubmissionSuccess={handleSubmissionSuccess}
        />
      )}
    </div>
  );
};

export default CourseDetail;