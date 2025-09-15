import { Server as IOServer } from 'socket.io';
import type { Server as HttpServer } from 'http';

// Exported io instance (will be initialized from index.ts)
export let io: IOServer | null = null;

export function initSocket(server: HttpServer) {
  if (io) return io; // already initialized

  io = new IOServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // allow joining project rooms
    socket.on('join', (payload: { projectId?: string }) => {
      if (payload?.projectId) {
        socket.join(`project:${payload.projectId}`);
      }
    });

    socket.on('leave', (payload: { projectId?: string }) => {
      if (payload?.projectId) {
        socket.leave(`project:${payload.projectId}`);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', socket.id, reason);
    });
  });

  return io;
}
