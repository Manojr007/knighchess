import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const { token } = useAuth();

    useEffect(() => {
        // Initialize socket only if we don't have one, or if we want to reconnect on auth change
        // For simplicity, we can connect anonymously too, but let's pass token if available
        const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
            auth: { token }
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, [token]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
