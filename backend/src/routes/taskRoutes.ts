import express from 'express';
import { updateTask } from '../controllers/taskController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * Task update request
 * @typedef {object} TaskUpdateRequest
 * @property {string} title - Task title
 * @property {string} description - Task description
 * @property {string} status - Task status - enum:pending,in-progress,done
 * @property {string} assignedTo - User ID of assignee
 * @property {string} dueDate - Due date in ISO format
 */

// Apply authentication middleware to all routes
router.use(protect);

/**
 * PUT /tasks/{id}
 * @tags Tasks
 * @summary Update a task
 * @security BearerAuth
 * @param {string} id.path.required - Task ID
 * @param {TaskUpdateRequest} request.body.required - Task update data
 * @return {object} 200 - Task updated successfully
 * @return {object} 401 - Unauthorized
 * @return {object} 403 - Forbidden
 * @return {object} 404 - Task not found
 */
router.put('/:id', updateTask);

export default router;