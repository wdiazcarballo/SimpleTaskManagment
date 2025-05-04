const express = require('express');
const router = express.Router();
const { 
  getTasks, 
  getTask, 
  createTask, 
  updateTask, 
  deleteTask 
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

// Routes for /api/tasks - all routes protected
router.route('/')
  .get(protect, getTasks)
  .post(protect, createTask);

// Routes for /api/tasks/:id - all routes protected
router.route('/:id')
  .get(protect, getTask)
  .put(protect, updateTask)
  .delete(protect, deleteTask);

module.exports = router;