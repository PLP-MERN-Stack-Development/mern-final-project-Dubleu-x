import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './SubmissionForm.css';

const SubmissionForm = ({ assignmentId, assignmentTitle, onClose, onSubmissionSuccess }) => {
  const [submissionText, setSubmissionText] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!submissionText.trim() && files.length === 0) {
      setError('Please provide either text submission or upload files');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('📝 Submitting assignment:', assignmentId);
      
      // Create form data for file uploads
      const formData = new FormData();
      formData.append('textSubmission', submissionText);
      formData.append('assignmentId', assignmentId);
      formData.append('studentId', user.id);
      
      // Append files if any
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await api.post(`/api/assignments/${assignmentId}/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('✅ Submission successful:', response.data);
      onSubmissionSuccess(response.data);
      alert('Assignment submitted successfully!');
      onClose();
      
    } catch (error) {
      console.error('❌ Submission error:', error);
      setError(error.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!submissionText.trim()) {
      setError('Please enter your submission text');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('📝 Submitting text assignment:', assignmentId);
      
      const response = await api.post(`/api/assignments/${assignmentId}/submit`, {
        textSubmission: submissionText,
        submittedAt: new Date().toISOString()
      });

      console.log('✅ Text submission successful:', response.data);
      onSubmissionSuccess(response.data);
      alert('Assignment submitted successfully!');
      onClose();
      
    } catch (error) {
      console.error('❌ Text submission error:', error);
      setError(error.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="submission-form-overlay">
      <div className="submission-form-modal">
        <div className="submission-form-header">
          <h2>Submit Assignment: {assignmentTitle}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="submission-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="submissionText">Your Submission Text:</label>
            <textarea
              id="submissionText"
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              placeholder="Enter your assignment submission here..."
              rows="8"
            />
          </div>

          <div className="form-group">
            <label htmlFor="fileUpload">Upload Files (Optional):</label>
            <input
              type="file"
              id="fileUpload"
              multiple
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
            />
            <div className="file-list">
              {files.map((file, index) => (
                <div key={index} className="file-item">
                  📎 {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="button"
              className="submit-btn"
              onClick={handleTextSubmit}
              disabled={loading || !submissionText.trim()}
            >
              {loading ? 'Submitting...' : 'Submit Text Only'}
            </button>
            {files.length > 0 && (
              <button 
                type="submit"
                className="submit-btn"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit with Files'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmissionForm;