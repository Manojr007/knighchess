import express from 'express';
import { getProfile, updateProfile, getStats } from '../controllers/profileController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/:userId', protect, getProfile);
router.put('/', protect, updateProfile);
router.get('/stats/me', protect, getStats);

export default router;
