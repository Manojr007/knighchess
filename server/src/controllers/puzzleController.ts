import { Request, Response } from 'express';
import Puzzle from '../models/Puzzle';
import User from '../models/User';

export const getRandomPuzzle = async (req: Request, res: Response) => {
    try {
        const { theme } = req.query;
        const query = theme ? { themes: theme } : {};

        const count = await Puzzle.countDocuments(query);
        if (count === 0) {
            return res.status(404).json({ message: 'No puzzles found for this theme' });
        }
        const random = Math.floor(Math.random() * count);
        const puzzle = await Puzzle.findOne(query).skip(random);

        if (!puzzle) {
            return res.status(404).json({ message: 'No puzzles available' });
        }

        // Don't send the solution moves to the client
        res.json({
            puzzleId: puzzle.puzzleId,
            fen: puzzle.fen,
            rating: puzzle.rating,
            themes: puzzle.themes,
        });
    } catch (error) {
        console.error('Error fetching puzzle:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const checkPuzzleSolution = async (req: Request, res: Response) => {
    try {
        const { puzzleId, moves } = req.body;
        // @ts-ignore
        const userId = req.user.id;

        const puzzle = await Puzzle.findOne({ puzzleId });
        if (!puzzle) {
            return res.status(404).json({ message: 'Puzzle not found' });
        }

        // Check if moves match the solution
        const isCorrect = JSON.stringify(moves) === JSON.stringify(puzzle.moves);

        // Update user stats
        const user = await User.findById(userId);
        if (user) {
            user.puzzleStats.attempted += 1;
            if (isCorrect) {
                user.puzzleStats.solved += 1;
                // Increase puzzle rating slightly
                user.puzzleStats.rating += 10;
            }
            await user.save();
        }

        res.json({
            correct: isCorrect,
            solution: puzzle.moves,
            newRating: user?.puzzleStats.rating,
        });
    } catch (error) {
        console.error('Error checking puzzle solution:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getPuzzleStats = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            solved: user.puzzleStats.solved,
            attempted: user.puzzleStats.attempted,
            rating: user.puzzleStats.rating,
            accuracy: user.puzzleStats.attempted > 0
                ? Math.round((user.puzzleStats.solved / user.puzzleStats.attempted) * 100)
                : 0,
        });
    } catch (error) {
        console.error('Error fetching puzzle stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
