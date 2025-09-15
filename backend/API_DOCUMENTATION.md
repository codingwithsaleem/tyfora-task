# Team Project Manager API Documentation

## Base URL
http://localhost:5000/api

## Swagger Documentation
Swagger UI is available at: http://localhost:5000/api-docs/

## Authentication
The API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header for protected routes:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

## Endpoints

### User Management
- **Register User**
  - Endpoint: `POST /users/register`
  - Access: Public
  - Request Body:
    ```json
    {
      "name": "John Doe",
      "email": "john@example.com",
      "password": "password123",
      "role": "member" // or "admin"
    }
    ```
  - Response: User details with JWT token

- **Login User**
  - Endpoint: `POST /users/login`
  - Access: Public
  - Request Body:
    ```json
    {
      "email": "john@example.com",
      "password": "password123"
    }
    ```
  - Response: User details with JWT token

### Project Management
- **Create Project**
  - Endpoint: `POST /projects`
  - Access: Private (requires authentication)
  - Request Body:
    ```json
    {
      "title": "New Project",
      "description": "Project description",
      "members": ["65f1a2b3c4d5e6f7a8b9c0d1", "65f1a2b3c4d5e6f7a8b9c0d2"] // Array of user IDs (valid MongoDB ObjectIds)
    }
    ```
  - Response: Project details
  - Note: The `members` field should contain an array of valid MongoDB ObjectId strings. For testing, you can use the ID of a user you've registered. For example:
    ```json
    {
      "title": "New Project",
      "description": "Project description", 
      "members": ["65f1a2b3c4d5e6f7a8b9c0d1"] // Use a real user ID from your database
    }
    ```

- **Get Project by ID**
  - Endpoint: `GET /projects/:id`
  - Access: Private (requires authentication)
  - Response: Project details with populated owner, members, and tasks

### Task Management
- **Create Task**
  - Endpoint: `POST /projects/:id/tasks`
  - Access: Private (requires authentication)
  - Request Body:
    ```json
    {
      "title": "New Task",
      "description": "Task description",
      "assignedTo": "65f1a2b3c4d5e6f7a8b9c0d1", // User ID (must be a valid MongoDB ObjectId)
      "dueDate": "2023-12-31" // Optional
    }
    ```
  - Response: Task details
  - Note: The `assignedTo` field must be a valid MongoDB ObjectId string that corresponds to a user in the database.

- **Update Task**
  - Endpoint: `PUT /tasks/:id`
  - Access: Private (requires authentication)
  - Request Body:
    ```json
    {
      "title": "Updated Task", // Optional
      "description": "Updated description", // Optional
      "status": "pending", // Optional: "pending", "in-progress", or "done"
      "assignedTo": "65f1a2b3c4d5e6f7a8b9c0d1", // Optional, must be a valid MongoDB ObjectId
      "dueDate": "2023-12-31" // Optional
    }
    ```
  - Response: Updated task details
  - Note: The `assignedTo` field must be a valid MongoDB ObjectId string that corresponds to a user in the database.

## Error Handling
The API provides clear error messages with appropriate HTTP status codes:
- 400: Bad Request (validation errors, duplicate entries)
- 401: Unauthorized (authentication errors)
- 403: Forbidden (permission errors)
- 404: Not Found (resource not found)
- 500: Server Error (unexpected errors)