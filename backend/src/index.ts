import express, { Express, Request, Response, NextFunction } from 'express';
import http from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import expressJSDocSwagger from 'express-jsdoc-swagger';
import connectDB from './config/db';
import { errorHandler, notFound } from './middleware/errorMiddleware';
import { getSwaggerOptions } from './config/swagger/options';
import userRoutes from './routes/userRoutes';
import projectRoutes from './routes/projectRoutes';
import taskRoutes from './routes/taskRoutes';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app: Express = express();
const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api`;
const SWAGGER_URL = `http://localhost:${PORT}/api-docs/`;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Setup Swagger
const swaggerOptions = getSwaggerOptions(BASE_URL, path.resolve(__dirname));
expressJSDocSwagger(app)(swaggerOptions);

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

// Health check route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'API is running' });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start the server using HTTP server so socket.io can attach
const server = http.createServer(app);

// Lazy import socket init to avoid circular deps
import('./socket').then(({ initSocket }) => {
  initSocket(server);
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger UI available at: ${SWAGGER_URL}`);
});

export default app;