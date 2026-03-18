const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');  // ✅ ADD THIS
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  completeTask
} = require('../controllers/taskController');

// ✅ ALL TASK ROUTES ARE PROTECTED NOW
router.route('/')
  .get(protect, getTasks)
  .post(protect, createTask);

router.route('/:id')
  .get(protect, getTaskById)
  .put(protect, updateTask)
  .delete(protect, deleteTask);

router.patch('/:id/complete', protect, completeTask);

module.exports = router;