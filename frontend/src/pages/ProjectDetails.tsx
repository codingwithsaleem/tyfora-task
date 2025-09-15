import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { useSocket } from '../hooks/useSocket';
import LoadingWrapper from '../components/LoadingWrapper';
import TaskList from '../components/TaskList';
import CreateTaskForm from '../components/CreateTaskForm';
import type { Project } from '../types/project';
import type { Task } from '../types/task';

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { socket, connected } = useSocket();
  
  useEffect(() => {
    if (!id) return;
    
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        
        // Fetch project details (includes populated tasks)
        const projectData = await projectService.getProject(id);

        setProject(projectData);
        // Use tasks returned inside the project payload
        setTasks(Array.isArray(projectData.tasks) ? projectData.tasks : []);
        setError(null);
      } catch (err) {
        console.error('Error fetching project details:', err);
        setError('Failed to load project details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjectData();
  }, [id]);

  // Set up socket.io event listeners for real-time updates
  useEffect(() => {
    if (!socket || !connected || !id) return;

    // Join the project room
    socket.emit('join', { projectId: id });

    // Handle new task event
    socket.on('task:created', (newTask: Task) => {
      if (newTask.project === id) {
        setTasks((prevTasks: Task[]) => [...prevTasks, newTask]);
      }
    });

    // Handle task updated event
    socket.on('task:updated', (updatedTask: Task) => {
      if (updatedTask.project === id) {
        setTasks((prevTasks: Task[]) => 
          prevTasks.map((task: Task) => task._id === updatedTask._id ? updatedTask : task)
        );
      }
    });

    // Handle task deleted event
    socket.on('task:deleted', (taskId: string) => {
      setTasks((prevTasks: Task[]) => prevTasks.filter((task: Task) => task._id !== taskId));
    });

    // Handle project updated event
    socket.on('project:updated', (updatedProject: Project) => {
      if (updatedProject._id === id) {
        setProject(updatedProject);
      }
    });

    // Clean up on unmount
    return () => {
      socket.emit('leave', { projectId: id });
      socket.off('task:created');
      socket.off('task:updated');
      socket.off('task:deleted');
      socket.off('project:updated');
    };
  }, [socket, connected, id]);
  
  const handleTaskCreate = async (newTask: Task) => {
    setTasks(prev => [...prev, newTask]);
  };
  
  const handleTaskUpdate = async (updatedTask: Task) => {
    setTasks(prev => 
      prev.map(task => task._id === updatedTask._id ? updatedTask : task)
    );
  };
  
  const handleTaskDelete = async (taskId: string) => {
    try {
      await taskService.deleteTask(taskId);
      setTasks(prev => prev.filter(task => task._id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task. Please try again.');
    }
  };
  
  const handleDeleteProject = async () => {
    if (!project || !id) return;
    
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        setLoading(true);
        await projectService.deleteProject(id);
        navigate('/projects');
      } catch (err) {
        console.error('Error deleting project:', err);
        setError('Failed to delete project. Please try again.');
        setLoading(false);
      }
    }
  };
  
  return (
    <div>
      <LoadingWrapper isLoading={loading} error={error}>
        {project && (
          <>
            <div className="mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
                  {project.description && (
                    <p className="mt-1 text-gray-600">{project.description}</p>
                  )}
                </div>
                <button
                  onClick={handleDeleteProject}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete Project
                </button>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-2">
                <div className="text-sm text-gray-500">
                  <span className="font-medium">Created:</span> {new Date(project.createdAt).toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-500">
                  <span className="font-medium">Team:</span> {project.members.length} members
                </div>
                {connected && (
                  <div className="text-sm text-green-500">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                    Real-time updates active
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white shadow rounded-lg mb-6 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Task</h2>
              <CreateTaskForm projectId={project._id} onTaskCreated={handleTaskCreate} />
            </div>
            
            <div className="bg-white shadow rounded-lg">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Tasks</h2>
                <TaskList 
                  tasks={tasks} 
                  onTaskUpdate={handleTaskUpdate} 
                  onTaskDelete={handleTaskDelete} 
                />
              </div>
            </div>
          </>
        )}
      </LoadingWrapper>
    </div>
  );
}