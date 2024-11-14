// src/hooks/useSocket.ts

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../../../src/context/AuthContext';
import API_URL from '../config'; // Import the API URL from config

export function useSocket() {
  const { isAuthenticated, token } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    if (!socketRef.current) {
      socketRef.current = io(API_URL, { // Use the imported API_URL
        path: '/socket.io',
        auth: {
          token
        },
        withCredentials: true,
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000
      });

      socketRef.current.on('connect', () => {
        console.log('Socket connected');
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
      });

      socketRef.current.on('error', (error) => {
        console.error('Socket error:', error);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, token]);

  return socketRef.current;
}
