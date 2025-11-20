import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './CreateLesson.css';

const CreateLesson = () => {
  const { id: courseId } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    videoUrl: '',
    duration: 30,
    order: 1,
    isPublished: true
  });
  const [course, setCourse] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const response = await api.get(`/api/courses/${courseId}`);
      setCourse(response.data);
      
      // Get the next order number
      const lessonsResponse = await api.get(`/api/lessons/course/${courseId}`);
      const nextOrder = lessonsResponse.data.length + 1;
      setFormData(prev => ({ ...prev, order: nextOrder }));
    } catch (error) {
      console.error('Error fetching course:', error);
      setError('Failed to load course');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const lessonData = {
        ...formData,
        courseId,
        duration: parseInt(formData.duration),
        order: parseInt(formData.order)
      };

      await api.post('/api/lessons', lessonData);
      navigate(`/courses/${courseId}`);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create lesson');
    } finally {
      setLoading(false);
    }
  };

  if (!course) {
    return <div className="loading">Loading course...</div>;
  }

  return (
    <div className="create-lesson">
      <div className="create-lesson-header">
        <h1>Create New Lesson</h1>
        <p>For course: <strong>{course.title}</strong></p>
      </div>

      <form onSubmit={handleSubmit} className="lesson-form">
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="title">Lesson Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Enter lesson title"
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Lesson Content *</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows="12"
            required
            placeholder="Enter the lesson content, instructions, or materials..."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="order">Lesson Order *</label>
            <input
              type="number"
              id="order"
              name="order"
              value={formData.order}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="duration">Duration (minutes) *</label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              min="1"
              max="480"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="videoUrl">Video URL (Optional)</label>
          <input
            type="url"
            id="videoUrl"
            name="videoUrl"
            value={formData.videoUrl}
            onChange={handleChange}
            placeholder="https://youtube.com/embed/..."
          />
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleChange}
            />
            <span className="checkmark"></span>
            Publish this lesson immediately
          </label>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Creating Lesson...' : 'Create Lesson'}
          </button>
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate(`/courses/${courseId}`)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateLesson;