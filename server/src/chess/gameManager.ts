import { Chess } from 'chess.js';
import Game, { IGame } from '../models/Game';
import { Server } from 'socket.io';
import { BotEngine } from './botEngine';

interface GameState {
    chess: Chess;
    whiteTime: number;
    blackTime: number;
    lastMoveTime: number;
    timerInterval: NodeJS.Timeout | null;
    whitePlayerId: string;
    blackPlayerId: string;
    isBot: boolean;
    botLevel: string;
    botColor: 'w' | 'b'; // Track which color the bot is playing
}

export class GameManager {
    private games: Map<string, GameState> = new Map();
    private io: Server;
    private botEngine: BotEngine;

    constructor(io: Server) {
        this.io = io;
        this.botEngine = new BotEngine();
    }

    public async createGame(gameId: string, fen: string, timeControl: string, whiteId: string, blackId: string, isBot: boolean = false, botLevel: string = 'random') {
        const chess = new Chess(fen);
        const [initialTime, increment] = timeControl.split('+').map(Number);
        const timeInMs = initialTime * 60 * 1000;

        // Determine bot color: if whiteId is 'bot', bot is white; if blackId is 'bot', bot is black
        const botColor: 'w' | 'b' = whiteId === 'bot' ? 'w' : 'b';

        this.games.set(gameId, {
            chess,
            whiteTime: timeInMs,
            blackTime: timeInMs,
            lastMoveTime: Date.now(),
            timerInterval: null,
            whitePlayerId: whiteId,
            blackPlayerId: blackId,
            isBot,
            botLevel,
            botColor
        });

        console.log(`Game created: ${gameId}, Bot: ${isBot}, Bot Color: ${botColor}, White: ${whiteId}, Black: ${blackId}`);

        // If bot is white, make the first move
        if (isBot && botColor === 'w') {
            setTimeout(() => this.makeBotMove(gameId), 1000);
        }
    }

    public async makeMove(gameId: string, move: { from: string; to: string; promotion?: string }, userId: string): Promise<boolean> {
        const gameState = this.games.get(gameId);
        if (!gameState) {
            console.log(`Game ${gameId} not found`);
            return false;
        }

        const { chess, whitePlayerId, blackPlayerId, isBot, botColor } = gameState;
        const isWhiteTurn = chess.turn() === 'w';

        console.log(`Move attempt: Game ${gameId}, User ${userId}, Turn: ${isWhiteTurn ? 'white' : 'black'}`);
        console.log(`Players: White=${whitePlayerId}, Black=${blackPlayerId}, Bot=${isBot}, BotColor=${botColor}`);

        // Prevent user from moving for the bot
        if (isBot && ((isWhiteTurn && botColor === 'w') || (!isWhiteTurn && botColor === 'b'))) {
            console.log('Cannot move for bot - it is the bot\'s turn');
            return false;
        }

        // Validate turn - check if user is the correct player for this turn
        if (isWhiteTurn) {
            // It's white's turn
            if (whitePlayerId !== 'bot' && userId !== whitePlayerId) {
                console.log('Not white player\'s turn');
                return false;
            }
        } else {
            // It's black's turn  
            if (blackPlayerId !== 'bot' && userId !== blackPlayerId) {
                console.log('Not black player\'s turn');
                return false;
            }
        }

        try {
            const result = chess.move(move);
            if (result) {
                console.log(`Move successful: ${result.san}`);
                this.updateTimer(gameId);
                gameState.lastMoveTime = Date.now();

                // Check for game over conditions
                let gameResult = null;
                let winner = null;

                if (chess.isCheckmate()) {
                    gameResult = isWhiteTurn ? 'white' : 'black';
                    winner = isWhiteTurn ? whitePlayerId : blackPlayerId;
                } else if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition()) {
                    gameResult = 'draw';
                }

                // Persist move to DB
                await Game.findByIdAndUpdate(gameId, {
                    $push: { moves: result.san },
                    fen: chess.fen(),
                    result: gameResult,
                    winner: winner,
                    status: gameResult ? 'completed' : 'active'
                });

                this.io.to(gameId).emit('move', {
                    move: result,
                    fen: chess.fen(),
                    moves: chess.history(),
                    whiteTime: gameState.whiteTime,
                    blackTime: gameState.blackTime,
                    turn: chess.turn(),
                    gameResult
                });

                if (gameResult) {
                    this.endGame(gameId, gameResult);
                } else {
                    // Trigger Bot Move if it's now the bot's turn
                    if (isBot && chess.turn() === botColor) {
                        console.log('Triggering bot move...');
                        setTimeout(() => this.makeBotMove(gameId), 500);
                    }
                }

                return true;
            }
        } catch (e) {
            console.error('Invalid move:', e);
            return false;
        }
        return false;
    }

    private async makeBotMove(gameId: string) {
        const gameState = this.games.get(gameId);
        if (!gameState) return;

        console.log(`Bot making move for game ${gameId}`);

        const move = await this.botEngine.getBestMove(gameState.chess.fen(), gameState.botLevel as any);
        if (move) {
            const { chess, botColor } = gameState;
            const result = chess.move(move);

            if (result) {
                console.log(`Bot moved: ${result.san}`);
                this.updateTimer(gameId);
                gameState.lastMoveTime = Date.now();

                // Check for game over conditions
                let gameResult = null;
                let winner = null;

                if (chess.isCheckmate()) {
                    gameResult = botColor === 'w' ? 'white' : 'black';
                    winner = null; // Bot has no ID
                } else if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition()) {
                    gameResult = 'draw';
                }

                await Game.findByIdAndUpdate(gameId, {
                    $push: { moves: result.san },
                    fen: chess.fen(),
                    result: gameResult,
                    winner: winner,
                    status: gameResult ? 'completed' : 'active'
                });

                this.io.to(gameId).emit('move', {
                    move: result,
                    fen: chess.fen(),
                    moves: chess.history(),
                    whiteTime: gameState.whiteTime,
                    blackTime: gameState.blackTime,
                    turn: chess.turn(),
                    gameResult
                });

                if (gameResult) {
                    this.endGame(gameId, gameResult);
                }
            }
        } else {
            console.log('Bot could not find a move');
        }
    }

    private updateTimer(gameId: string) {
        const gameState = this.games.get(gameId);
        if (!gameState) return;

        const now = Date.now();
        const elapsed = now - gameState.lastMoveTime;

        // Update time for the player who just moved
        if (gameState.chess.turn() === 'b') {
            gameState.whiteTime -= elapsed;
        } else {
            gameState.blackTime -= elapsed;
        }

        // Check for timeout
        if (gameState.whiteTime <= 0) {
            this.endGame(gameId, 'black');
        } else if (gameState.blackTime <= 0) {
            this.endGame(gameId, 'white');
        }
    }

    private async endGame(gameId: string, result: string) {
        const gameState = this.games.get(gameId);
        if (gameState) {
            this.games.delete(gameId);
            this.io.to(gameId).emit('gameOver', { result });

            await Game.findByIdAndUpdate(gameId, { status: 'completed', result });
        }
    }

    public getGameState(gameId: string) {
        return this.games.get(gameId);
    }
}

export let gameManager: GameManager;

export const initGameManager = (io: Server) => {
    gameManager = new GameManager(io);
    return gameManager;
};
