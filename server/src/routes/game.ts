import express from 'express';
import { createGame, getGame, getMyGames, getGamePgn } from '../controllers/gameController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/', protect, createGame);
router.get('/my', protect, getMyGames);
router.get('/:id/pgn', getGamePgn); // Public or protected? Public is fine for sharing.
router.get('/:id', protect, getGame);

export default router;
