const express = require('express');
const router = express.Router();
const { 
  getTasks, 
  getTask, 
  createTask, 
  updateTask, 
  deleteTask 
} = require('../controllers/taskController');

// Routes for /api/tasks
router.route('/')
  .get(getTasks)
  .post(createTask);

// Routes for /api/tasks/:id
router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

module.exports = router;