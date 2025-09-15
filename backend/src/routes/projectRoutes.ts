import express from 'express';
import { createProject, getProjectById, listProjects, updateProject, deleteProject, addMember, removeMember } from '../controllers/projectController';
import { createTask } from '../controllers/taskController';
import { protect } from '../middleware/authMiddleware';
import { validateFields } from '../middleware/validationMiddleware';

const router = express.Router();

/**
 * Project creation request
 * @typedef {object} ProjectCreateRequest
 * @property {string} title.required - Project title
 * @property {string} description - Project description
 * @property {array<string>} members - Array of user IDs who are members of the project. Use valid MongoDB ObjectIds. Single string values will be treated as a single member.
 */

/**
 * Project response
 * @typedef {object} ProjectResponse
 * @property {string} _id - Project ID
 * @property {string} title - Project title
 * @property {string} description - Project description
 * @property {string} owner - Owner user ID
 * @property {array<string>} members - Array of member user IDs
 * @property {array<string>} tasks - Array of task IDs
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Update timestamp
 */

/**
 * Task creation request
 * @typedef {object} TaskCreateRequest
 * @property {string} title.required - Task title
 * @property {string} description - Task description
 * @property {string} assignedTo - User ID of assignee
 * @property {string} dueDate - Due date in ISO format
 */

/**
 * Task response
 * @typedef {object} TaskResponse
 * @property {string} _id - Task ID
 * @property {string} title - Task title
 * @property {string} description - Task description
 * @property {string} status - Task status (pending, in-progress, done)
 * @property {string} assignedTo - User ID of assignee
 * @property {string} dueDate - Due date in ISO format
 * @property {string} project - Project ID
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Update timestamp
 */

// Apply authentication middleware to all routes
router.use(protect);

/**
 * POST /projects
 * @tags Projects
 * @summary Create a new project
 * @security BearerAuth
 * @param {ProjectCreateRequest} request.body.required - Project data
 * @return {ProjectResponse} 201 - Project created successfully
 * @return {object} 400 - Bad request
 * @return {object} 401 - Unauthorized
 */
router.post(
  '/',
  validateFields(['title']),
  createProject
);

/**
 * GET /projects/{id}
 * @tags Projects
 * @summary Get project by ID
 * @security BearerAuth
 * @param {string} id.path.required - Project ID
 * @return {ProjectResponse} 200 - Project found
 * @return {object} 401 - Unauthorized
 * @return {object} 403 - Forbidden
 * @return {object} 404 - Project not found
 */
router.get('/:id', getProjectById);

// List projects
router.get('/', listProjects);

// Update project
router.put('/:id', validateFields(['title']), updateProject);

// Delete project
router.delete('/:id', deleteProject);

/**
 * POST /projects/{id}/tasks
 * @tags Tasks
 * @summary Create a new task for a project
 * @security BearerAuth
 * @param {string} id.path.required - Project ID
 * @param {TaskCreateRequest} request.body.required - Task data
 * @return {TaskResponse} 201 - Task created successfully
 * @return {object} 400 - Bad request
 * @return {object} 401 - Unauthorized
 * @return {object} 403 - Forbidden
 * @return {object} 404 - Project not found
 */
router.post(
  '/:id/tasks',
  validateFields(['title']),
  createTask
);

// Add a member
router.post('/:id/members', validateFields(['userId']), addMember);

// Remove a member
router.delete('/:id/members/:userId', removeMember);

export default router;