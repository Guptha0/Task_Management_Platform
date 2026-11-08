const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTaskStats,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  addComment,
  deleteComment,
  logTime,
  aiTaskBreakdown,
  aiParseNaturalLanguage,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Telemetry & AI Copilot endpoints (must precede /:id)
router.get('/stats/summary', getTaskStats);
router.post('/ai/breakdown', aiTaskBreakdown);
router.post('/ai/parse', aiParseNaturalLanguage);

// Main CRUD routes
router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/:id')
  .get(getTaskById)
  .put(updateTask)
  .delete(deleteTask);

// Sub-resources: Comments & Time Tracking
router.route('/:id/comments')
  .post(addComment);

router.route('/:id/comments/:commentId')
  .delete(deleteComment);

router.route('/:id/time')
  .post(logTime);

module.exports = router;
