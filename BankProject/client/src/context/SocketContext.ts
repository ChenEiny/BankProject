import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { ServerToClientEvents, ClientToServerEvents, TransferNotification } from '../types/socket';

export const useSocket = (onTransferReceived?: (data: TransferNotification) => void) => {
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const callbackRef = useRef(onTransferReceived);

  useEffect(() => {
    callbackRef.current = onTransferReceived;
  }, [onTransferReceived]);

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000', {
      withCredentials: true, 
      transports: ['polling', 'websocket']
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('⚡ Connected to SafeBank Real-Time Service');
    });

    socket.on('TRANSFER_RECEIVED', (data: TransferNotification) => {
      console.log('🔔 Money transfer received:', data);
      if (callbackRef.current) {
        callbackRef.current(data);
      }
    });

    socket.on('connect_error', (err: Error) => {
      console.error('Socket Connection Error:', err.message);
    });

    return () => {
      socket.disconnect();
    };
  }, []); 

  return socketRef.current;
};