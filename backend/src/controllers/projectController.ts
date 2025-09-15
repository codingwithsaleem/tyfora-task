import { Request, Response, NextFunction } from 'express';
import { Project, Task, User } from '../models';
import { AppError } from '../middleware/errorMiddleware';

interface AuthRequest extends Request {
  user?: any;
}

/**
 * @desc    Create a new project
 * @route   POST /api/projects
 * @access  Private
 */
export const createProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, members } = req.body;

    // Create project without members first
    const project = new Project({
      title,
      description,
      owner: req.user._id,
      members: [], // Initialize with empty array
    });

    // Handle members array if it exists
    if (members) {
      // If members is a string, try to parse it if it's JSON, otherwise treat as a single ID
      if (typeof members === 'string') {
        try {
          const parsedMembers = JSON.parse(members);
          if (Array.isArray(parsedMembers)) {
            project.members = parsedMembers;
          } else {
            project.members = [require('mongoose').Types.ObjectId(members)]; // Use as a single ObjectId
          }
        } catch (e) {
          // Not valid JSON, use as a single ID
          project.members = [require('mongoose').Types.ObjectId(members)];
        }
      } else if (Array.isArray(members)) {
        // Ensure each member is treated as a string
        project.members = members.map(member => member.toString());
      }
    }

    // Save the project
    await project.save();

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get project by ID
 * @route   GET /api/projects/:id
 * @access  Private
 */
export const getProjectById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .populate({
        path: 'tasks',
        populate: {
          path: 'assignedTo',
          select: 'name email',
        },
      });

    if (project) {
      // Check if user is owner or member of the project
      const isOwner = project.owner._id.toString() === req.user._id.toString();
      const isMember = project.members.some(
        (member: any) => member._id.toString() === req.user._id.toString()
      );

      if (isOwner || isMember || req.user.role === 'admin') {
        res.json(project);
      } else {
        throw new AppError('Not authorized to access this project', 403);
      }
    } else {
      throw new AppError('Project not found', 404);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all projects for current user
 * @route   GET /api/projects
 * @access  Private
 */
export const listProjects = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Admins can see everything
    if (req.user.role === 'admin') {
      const projects = await Project.find()
        .populate('owner', 'name email')
        .populate('members', 'name email')
        .populate({ path: 'tasks', populate: { path: 'assignedTo', select: 'name email' } });

      res.json(projects);
      return;
    }

    const userId = req.user._id;
    const projects = await Project.find({ $or: [{ owner: userId }, { members: userId }] })
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .populate({ path: 'tasks', populate: { path: 'assignedTo', select: 'name email' } });

    res.json(projects);
  } catch (error) {
    next(error);
  }
};


/**
 * @desc    Update a project
 * @route   PUT /api/projects/:id
 * @access  Private
 */
export const updateProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // Only owner or admin can update
    const isOwner = project.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      throw new AppError('Not authorized to update this project', 403);
    }

    const { title, description, members } = req.body;
    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;

    if (members) {
      if (typeof members === 'string') {
        try {
          const parsed = JSON.parse(members);
          if (Array.isArray(parsed)) project.members = parsed.map((m: any) => m.toString());
        } catch (e) {
          project.members = [require('mongoose').Types.ObjectId(members)];
        }
      } else if (Array.isArray(members)) {
        project.members = members.map((m) => m.toString());
      }
    }

    const updated = await project.save();

    const populated = await Project.findById(updated._id)
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .populate({ path: 'tasks', populate: { path: 'assignedTo', select: 'name email' } });

    res.json(populated);
  } catch (error) {
    next(error);
  }
};


/**
 * @desc    Delete a project
 * @route   DELETE /api/projects/:id
 * @access  Private
 */
export const deleteProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) throw new AppError('Project not found', 404);

    const isOwner = project.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      throw new AppError('Not authorized to delete this project', 403);
    }

    // Delete related tasks
    await Task.deleteMany({ project: project._id });

    await project.deleteOne();

    res.json({ message: 'Project deleted' });
  } catch (error) {
    next(error);
  }
};


/**
 * @desc    Add a member to a project
 * @route   POST /api/projects/:id/members
 * @access  Private
 */
export const addMember = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.body;
    if (!userId) throw new AppError('userId is required', 400);

    const project = await Project.findById(req.params.id);
    if (!project) throw new AppError('Project not found', 404);

    // Only owner or admin can add members
    const isOwner = project.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      throw new AppError('Not authorized to add members to this project', 403);
    }

  const user = await User.findById(userId).select('_id');
  if (!user) throw new AppError('User not found', 404);

  const userIdStr = (user._id as any).toString();
  const already = project.members.some((m: any) => m.toString() === userIdStr);
    if (!already) {
      project.members.push(user._id as any);
      await project.save();
    }

    const populated = await Project.findById(project._id)
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .populate({ path: 'tasks', populate: { path: 'assignedTo', select: 'name email' } });

    res.json(populated);
  } catch (error) {
    next(error);
  }
};


/**
 * @desc    Remove a member from a project
 * @route   DELETE /api/projects/:id/members/:userId
 * @access  Private
 */
export const removeMember = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) throw new AppError('Project not found', 404);

    // Only owner or admin can remove members
    const isOwner = project.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      throw new AppError('Not authorized to remove members from this project', 403);
    }

    const userId = req.params.userId;
    project.members = project.members.filter((m: any) => m.toString() !== userId);
    await project.save();

    const populated = await Project.findById(project._id)
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .populate({ path: 'tasks', populate: { path: 'assignedTo', select: 'name email' } });

    res.json(populated);
  } catch (error) {
    next(error);
  }
};