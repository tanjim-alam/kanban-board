const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Board = require('../models/Board');
const auth = require('../middlewares/auth');

const router = express.Router();

// @route   GET /api/tasks/board/:boardId
// @desc    Get all tasks for a specific board
// @access  Private
router.get('/board/:boardId', auth, async (req, res) => {
  try {
    // Check if user has access to the board
    const board = await Board.findOne({
      _id: req.params.boardId,
      $or: [
        { owner: req.userId },
        { members: req.userId },
        { isPublic: true }
      ]
    });

    if (!board) {
      return res.status(404).json({ message: 'Board not found or access denied' });
    }

    const tasks = await Task.find({ boardId: req.params.boardId })
      .populate('assignees', 'username firstName lastName avatar')
      .populate('createdBy', 'username firstName lastName avatar')
      .populate('lastModifiedBy', 'username firstName lastName avatar')
      .sort({ position: 1 });

    res.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error while fetching tasks' });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get a specific task
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignees', 'username firstName lastName avatar')
      .populate('createdBy', 'username firstName lastName avatar')
      .populate('lastModifiedBy', 'username firstName lastName avatar')
      .populate('comments.user', 'username firstName lastName avatar');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has access to the board
    const board = await Board.findOne({
      _id: task.boardId,
      $or: [
        { owner: req.userId },
        { members: req.userId },
        { isPublic: true }
      ]
    });

    if (!board) {
      return res.status(404).json({ message: 'Access denied to this task' });
    }

    res.json({ task });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Server error while fetching task' });
  }
});

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', auth, [
  body('title').notEmpty().withMessage('Task title is required'),
  body('boardId').notEmpty().withMessage('Board ID is required'),
  body('columnId').notEmpty().withMessage('Column ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, boardId, columnId, priority, assignees, tags, dueDate, estimatedHours } = req.body;

    // Check if user has access to the board
    const board = await Board.findOne({
      _id: boardId,
      $or: [
        { owner: req.userId },
        { members: req.userId }
      ]
    });

    if (!board) {
      return res.status(404).json({ message: 'Board not found or access denied' });
    }

    // Get the next position for the task in the column
    const lastTask = await Task.findOne({ boardId, columnId })
      .sort({ position: -1 });
    const position = lastTask ? lastTask.position + 1 : 0;

    const task = new Task({
      title,
      description: description || '',
      boardId,
      columnId,
      priority: priority || 'medium',
      assignees: assignees || [],
      tags: tags || [],
      dueDate: dueDate ? new Date(dueDate) : null,
      estimatedHours: estimatedHours || 0,
      createdBy: req.userId,
      lastModifiedBy: req.userId,
      position
    });

    await task.save();

    // Update the column's taskIds array
    const column = board.columns.find(col => col.id === columnId);
    if (column) {
      column.taskIds.push(task._id.toString());
      await board.save();
    }

    const populatedTask = await Task.findById(task._id)
      .populate('assignees', 'username firstName lastName avatar')
      .populate('createdBy', 'username firstName lastName avatar')
      .populate('lastModifiedBy', 'username firstName lastName avatar');

    res.status(201).json({
      message: 'Task created successfully',
      task: populatedTask
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error while creating task' });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', auth, [
  body('title').optional().notEmpty().withMessage('Task title cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has access to the board
    const board = await Board.findOne({
      _id: task.boardId,
      $or: [
        { owner: req.userId },
        { members: req.userId }
      ]
    });

    if (!board) {
      return res.status(404).json({ message: 'Access denied to this task' });
    }

    const updateData = {
      ...req.body,
      lastModifiedBy: req.userId
    };

    // Handle date fields
    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('assignees', 'username firstName lastName avatar')
    .populate('createdBy', 'username firstName lastName avatar')
    .populate('lastModifiedBy', 'username firstName lastName avatar');

    res.json({
      message: 'Task updated successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error while updating task' });
  }
});

// @route   PUT /api/tasks/:id/move
// @desc    Move a task to a different column
// @access  Private
router.put('/:id/move', auth, [
  body('columnId').notEmpty().withMessage('Column ID is required'),
  body('position').isNumeric().withMessage('Position must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { columnId, position } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has access to the board
    const board = await Board.findOne({
      _id: task.boardId,
      $or: [
        { owner: req.userId },
        { members: req.userId }
      ]
    });

    if (!board) {
      return res.status(404).json({ message: 'Access denied to this task' });
    }

    const oldColumnId = task.columnId;

    // Update task position and column
    task.columnId = columnId;
    task.position = position;
    task.lastModifiedBy = req.userId;
    await task.save();

    // Update column taskIds arrays
    const oldColumn = board.columns.find(col => col.id === oldColumnId);
    const newColumn = board.columns.find(col => col.id === columnId);

    if (oldColumn && newColumn) {
      // Remove from old column
      oldColumn.taskIds = oldColumn.taskIds.filter(id => id !== task._id.toString());
      // Add to new column
      newColumn.taskIds.push(task._id.toString());
      await board.save();
    }

    const updatedTask = await Task.findById(task._id)
      .populate('assignees', 'username firstName lastName avatar')
      .populate('createdBy', 'username firstName lastName avatar')
      .populate('lastModifiedBy', 'username firstName lastName avatar');

    res.json({
      message: 'Task moved successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error('Move task error:', error);
    res.status(500).json({ message: 'Server error while moving task' });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has access to the board
    const board = await Board.findOne({
      _id: task.boardId,
      $or: [
        { owner: req.userId },
        { members: req.userId }
      ]
    });

    if (!board) {
      return res.status(404).json({ message: 'Access denied to this task' });
    }

    // Remove task from column's taskIds array
    const column = board.columns.find(col => col.id === task.columnId);
    if (column) {
      column.taskIds = column.taskIds.filter(id => id !== task._id.toString());
      await board.save();
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error while deleting task' });
  }
});

// @route   POST /api/tasks/:id/comments
// @desc    Add a comment to a task
// @access  Private
router.post('/:id/comments', auth, [
  body('content').notEmpty().withMessage('Comment content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has access to the board
    const board = await Board.findOne({
      _id: task.boardId,
      $or: [
        { owner: req.userId },
        { members: req.userId }
      ]
    });

    if (!board) {
      return res.status(404).json({ message: 'Access denied to this task' });
    }

    const { content } = req.body;

    task.comments.push({
      user: req.userId,
      content
    });

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('assignees', 'username firstName lastName avatar')
      .populate('createdBy', 'username firstName lastName avatar')
      .populate('lastModifiedBy', 'username firstName lastName avatar')
      .populate('comments.user', 'username firstName lastName avatar');

    res.json({
      message: 'Comment added successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error while adding comment' });
  }
});

module.exports = router;

