import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import gameRoutes from './routes/game';
import puzzleRoutes from './routes/puzzle';
import profileRoutes from './routes/profile';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/puzzles', puzzleRoutes);
app.use('/api/profile', profileRoutes);

app.get('/', (req, res) => {
    res.send('Anti-Chess API is running');
});

export default app;
