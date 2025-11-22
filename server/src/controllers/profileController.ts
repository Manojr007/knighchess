import { Request, Response } from 'express';
import User from '../models/User';

export const getProfile = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).select('-passwordHash');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            username: user.username,
            email: user.email,
            rating: user.rating,
            profile: user.profile,
            stats: user.stats,
            puzzleStats: user.puzzleStats,
            createdAt: user.createdAt,
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        const { avatar, bio, country } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (avatar !== undefined) user.profile.avatar = avatar;
        if (bio !== undefined) user.profile.bio = bio;
        if (country !== undefined) user.profile.country = country;

        await user.save();

        res.json({
            message: 'Profile updated successfully',
            profile: user.profile,
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getStats = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const totalGames = user.stats.wins + user.stats.losses + user.stats.draws;
        const winRate = totalGames > 0 ? Math.round((user.stats.wins / totalGames) * 100) : 0;

        res.json({
            rating: user.rating,
            gamesPlayed: totalGames,
            wins: user.stats.wins,
            losses: user.stats.losses,
            draws: user.stats.draws,
            winRate,
            puzzlesSolved: user.puzzleStats.solved,
            puzzlesAttempted: user.puzzleStats.attempted,
            puzzleRating: user.puzzleStats.rating,
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
