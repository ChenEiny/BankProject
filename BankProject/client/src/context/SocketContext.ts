import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { ServerToClientEvents, ClientToServerEvents, TransferNotification } from '../types/socket';

export const useSocket = (onTransferReceived?: (data: TransferNotification) => void) => {
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);

  useEffect(() => {
    // אם ה-JWT אצלך שמור ב-Cookie (כפי שרואים מ-cookieParser בשרת), 
    // Socket.io מעביר cookies אוטומטית אם withCredentials מוגדר true.
    // אם ה-Token שמור ב-localStorage/Auth Context, ניתן לשלוף אותו כאן:
    const token = localStorage.getItem('token'); 

    socketRef.current = io('http://localhost:3000', {
      auth: { token },
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('⚡ Connected to SafeBank Real-Time Service');
    });

    socket.on('TRANSFER_RECEIVED', (data: TransferNotification) => {
      console.log('🔔 Money transfer received:', data);
      if (onTransferReceived) {
        onTransferReceived(data);
      }
    });

    socket.on('connect_error', (err: Error) => {
      console.error('Socket Connection Error:', err.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [onTransferReceived]);

  return socketRef.current;
};