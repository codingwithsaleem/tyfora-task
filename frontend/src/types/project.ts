export interface Project {
  _id: string;
  title: string;
  description?: string;
  owner: string;
  members: string[];
  tasks: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectData {
  title: string;
  description?: string;
  members?: string[];
}