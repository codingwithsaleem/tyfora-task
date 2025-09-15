import { useEffect, useState, useRef } from 'react';
import type { ReactNode } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';
import { SocketContext } from './SocketContextBase';

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Only connect to socket if user is authenticated
    if (isAuthenticated) {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      // Initialize socket connection with auth token
      const socketInstance = io('http://localhost:5000', {
        auth: {
          token
        }
      });

      // Set up event listeners
      socketInstance.on('connect', () => {
        console.log('Socket connected', socketInstance.id);
        setConnected(true);
      });

      socketInstance.on('disconnect', () => {
        console.log('Socket disconnected', socketInstance.id);
        setConnected(false);
      });

      socketInstance.on('error', (error) => {
        console.error('Socket error:', error);
      });

      // Save socket instance to state and ref
      socketRef.current = socketInstance;
      setSocket(socketInstance);

      // Clean up on unmount
      return () => {
        socketInstance.disconnect();
        socketRef.current = null;
      };
    } else {
      // Disconnect if user logs out
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setConnected(false);
      }
    }
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};