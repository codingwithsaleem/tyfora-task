import { useState } from 'react';
import { taskService } from '../services/taskService';
import type { Task } from '../types/task';

interface TaskListProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
}

export default function TaskList({ tasks, onTaskUpdate, onTaskDelete }: TaskListProps) {
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  
  const handleStatusChange = async (task: Task, newStatus: 'pending' | 'in-progress' | 'done') => {
    try {
      const updatedTask = await taskService.updateStatus(task._id, newStatus);
      onTaskUpdate(updatedTask);
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString();
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'done':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No tasks found for this project.</p>
        <p className="text-sm text-gray-400 mt-1">Add your first task using the form above.</p>
      </div>
    );
  }
  
  return (
    <ul className="divide-y divide-gray-200">
      {tasks.map((task) => (
        <li key={task._id} className="py-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div
                className="cursor-pointer"
                onClick={() => setExpandedTaskId(expandedTaskId === task._id ? null : task._id)}
              >
                <h3 className="text-sm font-medium text-gray-900">{task.title}</h3>
                {expandedTaskId === task._id && task.description && (
                  <p className="mt-1 text-sm text-gray-500">{task.description}</p>
                )}
              </div>
              <div className="mt-2 flex items-center text-xs text-gray-500">
                <span>Due: {formatDate(task.dueDate)}</span>
                <span className="mx-2">•</span>
                <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="ml-4 flex-shrink-0 flex flex-col items-end">
              <div className="flex items-center space-x-2 mb-2">
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task, e.target.value as 'pending' | 'in-progress' | 'done')}
                  className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusColor(task.status)}`}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
                <button
                  onClick={() => onTaskDelete(task._id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}