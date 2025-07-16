import Task from "../models/taskModel.js";

// CREATE A NEW TASK
export const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, completed } = req.body;
    
    const task = new Task({
      title,
      description,
      priority,
      dueDate: dueDate && typeof dueDate === 'string' && dueDate.trim() !== '' ? dueDate : null,
      completed: completed === 'Yes' || completed === true,
      owner: req.user.id
    });

    const saved = await task.save();
    
    res.status(201).json({ success: true, task: saved });
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(400).json({ success: false, message: err.message }); // Fixed: message typo
  }
};

// GET TASKS FOR LOGGED IN USER
export const getTask = async (req, res) => {
  try {
    const tasks = await Task.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message }); // Fixed: message typo
  }
};

// GET SINGLE TASK BY ID (MUST BELONG TO THAT PARTICULAR USER)
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user.id });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found" // Fixed: message typo
      });
    }
    
    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message }); // Fixed: message typo
  }
};

// UPDATE A TASK
export const updateTask = async (req, res) => {
  try {
    const data = { ...req.body };
    
    
    // Handle completed field conversion
    if (data.completed !== undefined) {
      const originalCompleted = data.completed;
      data.completed = data.completed === 'Yes' || data.completed === 'YES' || data.completed === true;
    }
    
    const updated = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      data,
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Task not found or not authorized"
      });
    }
    
    res.json({ success: true, task: updated });
  } catch (err) {
    console.error('🔍 Backend updateTask: Error:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// DELETE A TASK
export const deleteTask = async (req, res) => {
  try {
    const deleted = await Task.findOneAndDelete({ 
      _id: req.params.id, 
      owner: req.user.id 
    });
    
    if (!deleted) {
      return res.status(404).json({
        success: false, 
        message: "Task not found or not authorized"
      });
    }
    
    res.json({ success: true, message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message }); // Fixed: message typo
  }
};