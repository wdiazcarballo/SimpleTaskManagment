import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TaskItem from '../components/TaskItem';
import { taskService } from '../services/api';
import '../styles/TaskList.css';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await taskService.getAllTasks();
        setTasks(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Failed to load tasks. Please try again later.');
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.deleteTask(id);
        setTasks(tasks.filter(task => task._id !== id));
      } catch (err) {
        console.error('Error deleting task:', err);
        setError('Failed to delete task. Please try again.');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading tasks...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <h1>Task List</h1>
        <Link to="/add" className="btn btn-add">
          Add New Task
        </Link>
      </div>

      {tasks.length === 0 ? (
        <div className="no-tasks">
          <p>No tasks found. Create a new task to get started!</p>
        </div>
      ) : (
        <div className="task-list">
          {tasks.map((task) => (
            <TaskItem 
              key={task._id} 
              task={task} 
              onDelete={handleDelete} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;