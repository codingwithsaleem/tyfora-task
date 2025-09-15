import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';
import LoadingWrapper from '../components/LoadingWrapper';

export default function CreateProject() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [members, setMembers] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Project title is required');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Parse members from comma-separated string to array
      const membersArray: string[] = members
        ? members.split(',').map(member => member.trim()).filter(Boolean)
        : [];

      // Only send members that look like valid Mongo ObjectId (24 hex chars)
      const objectIdRegex = /^[0-9a-fA-F]{24}$/;
      const validMembers = membersArray.filter(m => objectIdRegex.test(m));

      await projectService.createProject({
        title,
        description,
        members: validMembers
      });
      
      navigate('/projects');
    } catch (err) {
        console.error('Error creating project:', err);
        // Try to show backend error message when available
        const unknownErr = err as unknown;
        const axiosErr = unknownErr as { response?: { data?: unknown } };
        const data = axiosErr?.response?.data;
        let serverMsg: string | undefined;
        if (data && typeof data === 'object') {
          const d = data as Record<string, unknown>;
          if (typeof d.error === 'string') serverMsg = d.error;
          else if (typeof d.message === 'string') serverMsg = d.message;
        }
        if (serverMsg) {
          setError(serverMsg);
        } else {
          setError('Failed to create project. Please try again.');
        }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create a New Project</h1>
      
      <LoadingWrapper isLoading={loading} error={error}>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Project Title*
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                placeholder="Enter project title"
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description (optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                placeholder="Describe your project"
              />
            </div>
            
            <div>
              <label htmlFor="members" className="block text-sm font-medium text-gray-700">
                Team Members (optional)
              </label>
              <input
                type="text"
                id="members"
                value={members}
                onChange={(e) => setMembers(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                placeholder="Enter email addresses separated by commas"
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter email addresses of team members, separated by commas
              </p>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/projects')}
                className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={loading}
              >
                Create Project
              </button>
            </div>
          </form>
        </div>
      </LoadingWrapper>
    </div>
  );
}