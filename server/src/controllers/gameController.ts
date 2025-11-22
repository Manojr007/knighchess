import { Request, Response } from 'express';
import Game from '../models/Game';
import { gameManager } from '../chess/gameManager';

export const createGame = async (req: Request, res: Response) => {
    try {
        const { timeControl, botLevel, isBot, color } = req.body;
        // @ts-ignore
        const userId = req.user.id;

        let white = null;
        let black = null;

        if (isBot) {
            // Bot game: assign user to chosen color
            if (color === 'white') {
                white = userId;
                // black remains null (bot)
            } else if (color === 'black') {
                black = userId;
                // white remains null (bot)
            } else {
                // Random
                if (Math.random() < 0.5) {
                    white = userId;
                } else {
                    black = userId;
                }
            }
        } else {
            // Human vs Human (Open Game)
            if (color === 'white') {
                white = userId;
            } else if (color === 'black') {
                black = userId;
            } else {
                // Random
                if (Math.random() < 0.5) {
                    white = userId;
                } else {
                    black = userId;
                }
            }
        }

        const game = new Game({
            white: white,
            black: black,
            timeControl,
            isBot: !!isBot,
            botLevel: botLevel || 'random',
            status: 'active',
            fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
        });

        await game.save();

        // Initialize in GameManager
        const whiteIdForManager = white ? white.toString() : (isBot ? 'bot' : '');
        const blackIdForManager = black ? black.toString() : (isBot ? 'bot' : '');

        await gameManager.createGame(
            game._id.toString(),
            game.fen,
            timeControl,
            whiteIdForManager,
            blackIdForManager,
            !!isBot,
            botLevel
        );

        res.status(201).json(game);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getGame = async (req: Request, res: Response) => {
    try {
        const game = await Game.findById(req.params.id).populate('white').populate('black');
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }
        res.json(game);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getGamePgn = async (req: Request, res: Response) => {
    try {
        const game = await Game.findById(req.params.id).populate('white').populate('black');
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        const { Chess } = require('chess.js');
        const chess = new Chess();
        // @ts-ignore
        chess.header('White', game.white?.username || 'Bot', 'Black', game.black?.username || 'Bot', 'Date', game.createdAt.toISOString());

        for (const move of game.moves) {
            chess.move(move);
        }

        res.send(chess.pgn());
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getMyGames = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        const games = await Game.find({ $or: [{ white: userId }, { black: userId }] })
            .populate('white')
            .populate('black')
            .sort({ createdAt: -1 });
        res.json(games);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
