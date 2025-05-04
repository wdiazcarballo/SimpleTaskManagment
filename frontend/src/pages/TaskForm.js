import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { taskService } from '../services/api';
import '../styles/TaskForm.css';

const TaskForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      const fetchTask = async () => {
        try {
          setLoading(true);
          const task = await taskService.getTaskById(id);
          setFormData({
            title: task.title,
            description: task.description || '',
            status: task.status,
            priority: task.priority
          });
          setLoading(false);
        } catch (err) {
          console.error('Error fetching task:', err);
          setError('Failed to load task data. Please try again.');
          setLoading(false);
        }
      };

      fetchTask();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditMode) {
        await taskService.updateTask(id, formData);
      } else {
        await taskService.createTask(formData);
      }
      navigate('/');
    } catch (err) {
      console.error('Error saving task:', err);
      setError('Failed to save task. Please check your input and try again.');
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return <div className="loading">Loading task data...</div>;
  }

  return (
    <div className="task-form-container">
      <h1>{isEditMode ? 'Edit Task' : 'Create New Task'}</h1>
      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit} className="task-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Enter task title"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter task description"
            rows="4"
          />
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate('/')}
            className="btn btn-cancel"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="btn btn-submit"
            disabled={loading}
          >
            {loading ? 'Saving...' : isEditMode ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;