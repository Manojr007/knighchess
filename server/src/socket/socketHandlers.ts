import { Server, Socket } from 'socket.io';
import { gameManager } from '../chess/gameManager';
import { matchmakingQueue } from '../chess/matchmakingQueue';
import Game from '../models/Game';
import User from '../models/User';

export const setupSocketHandlers = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        console.log('New client connected:', socket.id);

        socket.on('join_game', async (gameId: string) => {
            socket.join(gameId);
            console.log(`Socket ${socket.id} joined game ${gameId}`);
        });

        socket.on('make_move', async (data: { gameId: string; move: any; userId: string }) => {
            const { gameId, move, userId } = data;
            console.log(`Received make_move:`, data);
            const success = await gameManager.makeMove(gameId, move, userId);
            if (!success) {
                console.log(`Move failed for game ${gameId}`);
                socket.emit('error', 'Invalid move');
            }
        });

        socket.on('search_match', async (data: { userId: string; timeControl: string; color: string }) => {
            const { userId, timeControl, color } = data;
            console.log(`User ${userId} searching for match: ${timeControl}`);

            try {
                const user = await User.findById(userId);
                if (!user) {
                    socket.emit('error', 'User not found');
                    return;
                }

                // Try to find a match
                const match = matchmakingQueue.findMatch(userId, timeControl);

                if (match) {
                    // Match found! Create game
                    console.log(`Match found: ${user.username} vs ${match.username}`);

                    // Determine colors randomly or based on preference
                    const player1IsWhite = Math.random() < 0.5;
                    const whiteId = player1IsWhite ? userId : match.userId;
                    const blackId = player1IsWhite ? match.userId : userId;

                    // Create game
                    const game = new Game({
                        white: whiteId,
                        black: blackId,
                        timeControl,
                        isBot: false,
                        status: 'active',
                        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
                    });

                    await game.save();

                    // Initialize in GameManager
                    await gameManager.createGame(
                        game._id.toString(),
                        game.fen,
                        timeControl,
                        whiteId,
                        blackId,
                        false
                    );

                    // Notify both players
                    socket.emit('match_found', { gameId: game._id.toString(), color: player1IsWhite ? 'white' : 'black' });
                    io.to(match.socketId).emit('match_found', { gameId: game._id.toString(), color: player1IsWhite ? 'black' : 'white' });

                    console.log(`Game created: ${game._id}`);
                } else {
                    // No match found, add to queue
                    matchmakingQueue.addToQueue(userId, user.username, timeControl, socket.id);
                    socket.emit('searching', { message: 'Searching for opponent...' });
                }
            } catch (error) {
                console.error('Matchmaking error:', error);
                socket.emit('error', 'Matchmaking failed');
            }
        });

        socket.on('cancel_search', (data: { userId: string }) => {
            const { userId } = data;
            console.log(`User ${userId} cancelled search`);
            matchmakingQueue.removeFromQueue(userId);
            socket.emit('search_cancelled', { message: 'Search cancelled' });
        });

        socket.on('send_message', async (data: { gameId: string; message: string; sender: string }) => {
            const { gameId, message, sender } = data;
            try {
                const game = await Game.findById(gameId);
                if (game) {
                    const chatMessage = { sender, message, timestamp: new Date() };
                    game.chat.push(chatMessage);
                    await game.save();
                    io.to(gameId).emit('receive_message', chatMessage);
                }
            } catch (error) {
                console.error('Error sending message:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
            // Remove from matchmaking queue
            matchmakingQueue.removeBySocketId(socket.id);
        });
    });
};
