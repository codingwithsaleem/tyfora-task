import api from './api';
import type { Task, CreateTaskData, UpdateTaskData } from '../types/task';

export const taskService = {
  // Get all tasks for a project
  getProjectTasks: async (projectId: string): Promise<Task[]> => {
    const response = await api.get<Task[]>(`/projects/${projectId}/tasks`);
    return response.data;
  },

  // Get a specific task by ID
  getTask: async (taskId: string): Promise<Task> => {
    const response = await api.get<Task>(`/tasks/${taskId}`);
    return response.data;
  },

  // Create a new task
  createTask: async (projectId: string, taskData: CreateTaskData): Promise<Task> => {
    const response = await api.post<Task>(`/projects/${projectId}/tasks`, taskData);
    return response.data;
  },

  // Update a task
  updateTask: async (taskId: string, taskData: UpdateTaskData): Promise<Task> => {
    const response = await api.put<Task>(`/tasks/${taskId}`, taskData);
    return response.data;
  },

  // Delete a task
  deleteTask: async (taskId: string): Promise<void> => {
    await api.delete(`/tasks/${taskId}`);
  },

  // Assign a task to a user
  assignTask: async (taskId: string, userId: string): Promise<Task> => {
    const response = await api.post<Task>(`/tasks/${taskId}/assign`, { userId });
    return response.data;
  },

  // Update task status
  updateStatus: async (taskId: string, status: 'pending' | 'in-progress' | 'done'): Promise<Task> => {
    // Backend accepts status as part of PUT /tasks/:id
    const response = await api.put<Task>(`/tasks/${taskId}`, { status });
    return response.data;
  },
};