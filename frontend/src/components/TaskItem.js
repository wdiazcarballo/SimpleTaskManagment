import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/TaskItem.css';

const TaskItem = ({ task, onDelete }) => {
  const getPriorityClass = () => {
    switch (task.priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return '';
    }
  };

  const getStatusClass = () => {
    switch (task.status) {
      case 'completed':
        return 'status-completed';
      case 'in_progress':
        return 'status-in-progress';
      case 'pending':
        return 'status-pending';
      default:
        return '';
    }
  };

  return (
    <div className={`task-item ${getStatusClass()}`}>
      <div className="task-content">
        <h3 className="task-title">{task.title}</h3>
        <p className="task-description">{task.description}</p>
        <div className="task-meta">
          <span className={`task-priority ${getPriorityClass()}`}>
            {task.priority}
          </span>
          <span className={`task-status ${getStatusClass()}`}>
            {task.status}
          </span>
          <span className="task-date">
            {new Date(task.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      <div className="task-actions">
        <Link to={`/edit/${task._id}`} className="btn btn-edit">
          Edit
        </Link>
        <button onClick={() => onDelete(task._id)} className="btn btn-delete">
          Delete
        </button>
      </div>
    </div>
  );
};

export default TaskItem;