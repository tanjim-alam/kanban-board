const express = require('express');
const { body, validationResult } = require('express-validator');
const Board = require('../models/Board');
const Task = require('../models/Task');
const auth = require('../middlewares/auth');

const router = express.Router();

// @route   GET /api/boards
// @desc    Get all boards for the user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const boards = await Board.find({
      $or: [
        { owner: req.userId },
        { members: req.userId }
      ]
    })
    .populate('owner', 'username firstName lastName avatar')
    .populate('members', 'username firstName lastName avatar')
    .sort({ updatedAt: -1 });

    res.json({ boards });
  } catch (error) {
    console.error('Get boards error:', error);
    res.status(500).json({ message: 'Server error while fetching boards' });
  }
});

// @route   GET /api/boards/:id
// @desc    Get a specific board with tasks
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const board = await Board.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.userId },
        { members: req.userId },
        { isPublic: true }
      ]
    })
    .populate('owner', 'username firstName lastName avatar')
    .populate('members', 'username firstName lastName avatar');

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Get all tasks for this board
    const tasks = await Task.find({ boardId: board._id })
      .populate('assignees', 'username firstName lastName avatar')
      .populate('createdBy', 'username firstName lastName avatar')
      .populate('lastModifiedBy', 'username firstName lastName avatar')
      .sort({ position: 1 });

    // Organize tasks by column
    const tasksByColumn = {};
    tasks.forEach(task => {
      if (!tasksByColumn[task.columnId]) {
        tasksByColumn[task.columnId] = [];
      }
      tasksByColumn[task.columnId].push(task);
    });

    res.json({ 
      board: {
        ...board.toObject(),
        tasks: tasksByColumn
      }
    });
  } catch (error) {
    console.error('Get board error:', error);
    res.status(500).json({ message: 'Server error while fetching board' });
  }
});

// @route   POST /api/boards
// @desc    Create a new board
// @access  Private
router.post('/', auth, [
  body('title').notEmpty().withMessage('Board title is required'),
  body('description').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, isPublic } = req.body;

    // Create default columns
    const defaultColumns = [
      { id: 'todo', title: 'To Do', taskIds: [], color: '#3498db' },
      { id: 'in-progress', title: 'In Progress', taskIds: [], color: '#f39c12' },
      { id: 'done', title: 'Done', taskIds: [], color: '#27ae60' }
    ];

    const board = new Board({
      title,
      description: description || '',
      columns: defaultColumns,
      columnOrder: ['todo', 'in-progress', 'done'],
      owner: req.userId,
      members: [req.userId],
      isPublic: isPublic || false
    });

    await board.save();

    const populatedBoard = await Board.findById(board._id)
      .populate('owner', 'username firstName lastName avatar')
      .populate('members', 'username firstName lastName avatar');

    res.status(201).json({
      message: 'Board created successfully',
      board: populatedBoard
    });
  } catch (error) {
    console.error('Create board error:', error);
    res.status(500).json({ message: 'Server error while creating board' });
  }
});

// @route   PUT /api/boards/:id
// @desc    Update a board
// @access  Private
router.put('/:id', auth, [
  body('title').optional().notEmpty().withMessage('Board title cannot be empty'),
  body('description').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const board = await Board.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.userId },
        { members: req.userId }
      ]
    });

    if (!board) {
      return res.status(404).json({ message: 'Board not found or access denied' });
    }

    const { title, description, isPublic, settings } = req.body;
    const updateData = {};

    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (settings) updateData.settings = { ...board.settings, ...settings };

    const updatedBoard = await Board.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('owner', 'username firstName lastName avatar')
    .populate('members', 'username firstName lastName avatar');

    res.json({
      message: 'Board updated successfully',
      board: updatedBoard
    });
  } catch (error) {
    console.error('Update board error:', error);
    res.status(500).json({ message: 'Server error while updating board' });
  }
});

// @route   DELETE /api/boards/:id
// @desc    Delete a board
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const board = await Board.findOne({
      _id: req.params.id,
      owner: req.userId
    });

    if (!board) {
      return res.status(404).json({ message: 'Board not found or access denied' });
    }

    // Delete all tasks associated with this board
    await Task.deleteMany({ boardId: board._id });

    // Delete the board
    await Board.findByIdAndDelete(req.params.id);

    res.json({ message: 'Board deleted successfully' });
  } catch (error) {
    console.error('Delete board error:', error);
    res.status(500).json({ message: 'Server error while deleting board' });
  }
});

// @route   POST /api/boards/:id/members
// @desc    Add a member to the board
// @access  Private
router.post('/:id/members', auth, [
  body('userId').notEmpty().withMessage('User ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const board = await Board.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.userId },
        { members: req.userId }
      ]
    });

    if (!board) {
      return res.status(404).json({ message: 'Board not found or access denied' });
    }

    const { userId } = req.body;

    if (board.members.includes(userId)) {
      return res.status(400).json({ message: 'User is already a member of this board' });
    }

    board.members.push(userId);
    await board.save();

    const updatedBoard = await Board.findById(board._id)
      .populate('owner', 'username firstName lastName avatar')
      .populate('members', 'username firstName lastName avatar');

    res.json({
      message: 'Member added successfully',
      board: updatedBoard
    });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ message: 'Server error while adding member' });
  }
});

// @route   DELETE /api/boards/:id/members/:userId
// @desc    Remove a member from the board
// @access  Private
router.delete('/:id/members/:userId', auth, async (req, res) => {
  try {
    const board = await Board.findOne({
      _id: req.params.id,
      owner: req.userId
    });

    if (!board) {
      return res.status(404).json({ message: 'Board not found or access denied' });
    }

    const { userId } = req.params;

    if (userId === board.owner.toString()) {
      return res.status(400).json({ message: 'Cannot remove the board owner' });
    }

    board.members = board.members.filter(member => member.toString() !== userId);
    await board.save();

    const updatedBoard = await Board.findById(board._id)
      .populate('owner', 'username firstName lastName avatar')
      .populate('members', 'username firstName lastName avatar');

    res.json({
      message: 'Member removed successfully',
      board: updatedBoard
    });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ message: 'Server error while removing member' });
  }
});

module.exports = router;

