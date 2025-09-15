import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../services/projectService';
import LoadingWrapper from '../components/LoadingWrapper';
import type { Project } from '../types/project';

export default function ProjectList() {
  // Don't automatically call GET /projects because the backend may not expose this endpoint.
  // Provide a manual "Load projects" button so the user can load if the backend supports it.
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getProjects();
      setProjects(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-load projects on mount. If backend doesn't support the endpoint, fetchProjects
    // will gracefully return an empty list (handled in projectService.getProjects).
    fetchProjects();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
        <Link
          to="/projects/create"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create Project
        </Link>
      </div>

      <LoadingWrapper isLoading={loading} error={error}>
        <div className="mb-4">
          <button
            onClick={fetchProjects}
            className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Load Projects
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-500 mb-6">You haven't created any projects yet.</p>
            <Link
              to="/projects/create"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Create your first project
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project: Project) => (
              <Link 
                to={`/projects/${project._id}`} 
                key={project._id}
                className="block bg-white overflow-hidden shadow rounded-lg transition hover:shadow-md"
              >
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 truncate">{project.title}</h3>
                  {project.description && (
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">{project.description}</p>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {project.tasks.length} {project.tasks.length === 1 ? 'task' : 'tasks'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {project.members.length} {project.members.length === 1 ? 'member' : 'members'}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6">
                  <div className="text-sm text-gray-500">
                    Created on {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </LoadingWrapper>
    </div>
  );
}