import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import connectDB from './config/db';
import dotenv from 'dotenv';
import { setupSocketHandlers } from './socket/socketHandlers';

dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB();

import { initGameManager } from './chess/gameManager';

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
    },
});

export const gameManager = initGameManager(io);
setupSocketHandlers(io);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
