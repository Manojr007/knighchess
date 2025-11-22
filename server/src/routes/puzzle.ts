import express from 'express';
import { getRandomPuzzle, checkPuzzleSolution, getPuzzleStats } from '../controllers/puzzleController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/random', protect, getRandomPuzzle);
router.post('/check', protect, checkPuzzleSolution);
router.get('/stats', protect, getPuzzleStats);

export default router;
