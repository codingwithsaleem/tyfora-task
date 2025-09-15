import { Request, Response, NextFunction } from 'express';
import { Task, Project } from '../models';
import { AppError } from '../middleware/errorMiddleware';
import { io } from '../socket';

interface AuthRequest extends Request {
  user?: any;
}

/**
 * @desc    Create a new task for a project
 * @route   POST /api/projects/:id/tasks
 * @access  Private
 */
export const createTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, assignedTo, dueDate } = req.body;
    const projectId = req.params.id;

    // Check if project exists and user has access
    const project = await Project.findById(projectId);

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // Check if user is authorized to add tasks to this project
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isMember = project.members.some(
      (member) => member.toString() === req.user._id.toString()
    );

    if (!isOwner && !isMember && req.user.role !== 'admin') {
      throw new AppError('Not authorized to add tasks to this project', 403);
    }

    // Process assignedTo if it's provided
    let assigneeId = undefined;
    if (assignedTo) {
      if (typeof assignedTo === 'string') {
        // Keep the assignedTo as is if it's a simple string (assuming it's a valid ObjectId)
        assigneeId = assignedTo;
      } else if (typeof assignedTo === 'object') {
        // If it's an object or array, log it for debugging
        console.log('Received assignedTo:', assignedTo);
        // Convert to string if possible
        if (assignedTo.toString && typeof assignedTo.toString === 'function') {
          assigneeId = assignedTo.toString();
        }
      }
    }

    // Create task
    const task = await Task.create({
      title,
      description,
      assignedTo: assigneeId,
      dueDate,
      project: projectId,
    });

    if (task) {
      // Add task to project
      project.tasks.push(task._id as any);
      await project.save();

      // Emit socket event to project room
      try {
        io?.to(`project:${projectId}`).emit('task:created', task);
      } catch (e) {
        console.warn('Socket emit failed:', e);
      }

      res.status(201).json(task);
    } else {
      throw new AppError('Invalid task data', 400);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a task
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
export const updateTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, status, assignedTo, dueDate } = req.body;
    const taskId = req.params.id;

    // Find task
    const task = await Task.findById(taskId);

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    // Check if project exists and user has access
    const project = await Project.findById(task.project);

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // Check if user is authorized to update tasks in this project
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isMember = project.members.some(
      (member) => member.toString() === req.user._id.toString()
    );
    const isAssignee = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();

    if (!isOwner && !isMember && !isAssignee && req.user.role !== 'admin') {
      throw new AppError('Not authorized to update this task', 403);
    }

    // Update task
    task.title = title || task.title;
    task.description = description !== undefined ? description : task.description;
    task.status = status || task.status;
    
    // Process assignedTo if it's provided
    if (assignedTo) {
      if (typeof assignedTo === 'string') {
        // Keep the assignedTo as is if it's a simple string (assuming it's a valid ObjectId)
        task.assignedTo = assignedTo as any;
      } else if (typeof assignedTo === 'object') {
        // If it's an object or array, log it for debugging
        console.log('Update Task - Received assignedTo:', assignedTo);
        // Convert to string if possible
        if (assignedTo.toString && typeof assignedTo.toString === 'function') {
          task.assignedTo = assignedTo.toString() as any;
        }
      }
    }
    
    task.dueDate = dueDate || task.dueDate;

    const updatedTask = await task.save();

    try {
      io?.to(`project:${project._id}`).emit('task:updated', updatedTask);
    } catch (e) {
      console.warn('Socket emit failed:', e);
    }

    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
};