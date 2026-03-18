const Task = require('../models/Task');

// @desc    Get user's tasks (only logged in user's tasks)
// @route   GET /api/tasks
const getTasks = async (req, res) => {
  try {
    // Sirf logged in user ke tasks
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single task (check ownership)
// @route   GET /api/tasks/:id
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({ 
      _id: req.params.id,
      user: req.user._id  // Sirf agar user ka task hai
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create a task (automatically assign to logged in user)
// @route   POST /api/tasks
const createTask = async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a title'
      });
    }
    
    // AI Priority Logic
    let priority = 'Medium';
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('urgent') || 
        titleLower.includes('important') || 
        titleLower.includes('asap') ||
        titleLower.includes('critical')) {
      priority = 'High';
    } else if (titleLower.includes('later') || 
               titleLower.includes('someday') || 
               titleLower.includes('maybe')) {
      priority = 'Low';
    }
    
    // User ID automatically add karo
    const task = new Task({
      user: req.user._id,  // ✅ Logged in user ka ID
      title,
      description,
      priority,
      dueDate: dueDate || null
    });
    
    const createdTask = await task.save();
    
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: createdTask
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Invalid task data',
      error: error.message
    });
  }
};

// @desc    Update a task (check ownership)
// @route   PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    // Pehle check karo ki task user ka hai
    const task = await Task.findOne({ 
      _id: req.params.id,
      user: req.user._id 
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or unauthorized'
      });
    }
    
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Invalid update data',
      error: error.message
    });
  }
};

// @desc    Delete a task (check ownership)
// @route   DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    // Pehle check karo ki task user ka hai
    const task = await Task.findOne({ 
      _id: req.params.id,
      user: req.user._id 
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or unauthorized'
      });
    }
    
    await task.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Mark task as complete (check ownership)
// @route   PATCH /api/tasks/:id/complete
const completeTask = async (req, res) => {
  try {
    // Pehle check karo ki task user ka hai
    const task = await Task.findOne({ 
      _id: req.params.id,
      user: req.user._id 
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or unauthorized'
      });
    }
    
    task.status = 'Completed';
    task.updatedAt = Date.now();
    await task.save();
    
    res.status(200).json({
      success: true,
      message: 'Task marked as completed',
      data: task
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error completing task',
      error: error.message
    });
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  completeTask
};