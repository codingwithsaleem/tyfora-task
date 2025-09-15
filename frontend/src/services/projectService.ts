import api from './api';
import type { Project, CreateProjectData } from '../types/project';

export const projectService = {
  // Get all projects for the current user
  getProjects: async (): Promise<Project[]> => {
    try {
      const response = await api.get<Project[]>('/projects');
      return response.data;
    } catch (error: unknown) {
      // If the backend doesn't expose a list endpoint yet, handle gracefully
      // Narrow to axios-like error shape safely
      const axiosErr = error as { response?: { status?: number } };
      if (axiosErr?.response?.status === 404) {
        console.warn('GET /projects not found on backend — returning empty list');
        return [];
      }
      throw error;
    }
  },

  // Get a specific project by ID
  getProject: async (id: string): Promise<Project> => {
    const response = await api.get<Project>(`/projects/${id}`);
    return response.data;
  },

  // Create a new project
  createProject: async (projectData: CreateProjectData): Promise<Project> => {
    const response = await api.post<Project>('/projects', projectData);
    return response.data;
  },

  // Update a project
  updateProject: async (id: string, projectData: Partial<CreateProjectData>): Promise<Project> => {
    const response = await api.put<Project>(`/projects/${id}`, projectData);
    return response.data;
  },

  // Delete a project
  deleteProject: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },

  // Add a user to a project
  addMember: async (projectId: string, userId: string): Promise<Project> => {
    const response = await api.post<Project>(`/projects/${projectId}/members`, { userId });
    return response.data;
  },

  // Remove a user from a project
  removeMember: async (projectId: string, userId: string): Promise<Project> => {
    const response = await api.delete<Project>(`/projects/${projectId}/members/${userId}`);
    return response.data;
  },
};