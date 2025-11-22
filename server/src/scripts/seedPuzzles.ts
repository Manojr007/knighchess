import Puzzle from '../models/Puzzle';
import connectDB from '../config/db';

const samplePuzzles = [
    {
        puzzleId: 'puzzle1',
        fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
        moves: ['f3e5', 'c6e5'],
        rating: 1200,
        themes: ['fork', 'knight'],
        popularity: 100
    },
    {
        puzzleId: 'puzzle2',
        fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 5',
        moves: ['c4f7', 'e8f7', 'd1d5'],
        rating: 1400,
        themes: ['sacrifice', 'fork'],
        popularity: 150
    },
    {
        puzzleId: 'puzzle3',
        fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
        moves: ['f3e5', 'c6e5', 'd1h5'],
        rating: 1000,
        themes: ['fork', 'queen'],
        popularity: 200
    },
    {
        puzzleId: 'puzzle4',
        fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R b KQkq - 0 5',
        moves: ['c6d4', 'f3d4', 'c5f2'],
        rating: 1600,
        themes: ['fork', 'discovered-attack'],
        popularity: 120
    },
    {
        puzzleId: 'puzzle5',
        fen: 'rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
        moves: ['f3e5', 'd8e7', 'd1e2'],
        rating: 1100,
        themes: ['pin'],
        popularity: 180
    },
    {
        puzzleId: 'mate1_1',
        fen: '6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1', // Back rank mate
        moves: ['a1a8'],
        rating: 800,
        themes: ['mateIn1'],
        popularity: 100
    },
    {
        puzzleId: 'mate1_2',
        fen: 'rnbqkbnr/ppppp2p/5p2/6p1/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 3', // Fool's mate pattern
        moves: ['d1h5'],
        rating: 800,
        themes: ['mateIn1'],
        popularity: 100
    },
    {
        puzzleId: 'mate2_1',
        fen: 'r2qkb1r/pp2nppp/3p4/2pNN1B1/2BnP3/3P4/PPP2PPP/R2bK2R w KQkq - 1 10', // Smothered mate pattern
        moves: ['d5f6', 'g7f6', 'c4f7'],
        rating: 1200,
        themes: ['mateIn2'],
        popularity: 100
    },
    {
        puzzleId: 'mate2_2',
        fen: 'r1b2rk1/1p3ppp/p7/8/8/5Q2/Pq3PPP/3RR1K1 w - - 0 1',
        moves: ['f3f7', 'f8f7', 'd1d8'],
        rating: 1300,
        themes: ['mateIn2'],
        popularity: 100
    }
];

export const seedPuzzles = async () => {
    try {
        await connectDB();

        const count = await Puzzle.countDocuments();
        if (count > 0) {
            console.log('Puzzles already seeded');
            return;
        }

        await Puzzle.insertMany(samplePuzzles);
        console.log('✅ Puzzles seeded successfully');
    } catch (error) {
        console.error('Error seeding puzzles:', error);
    }
};

// Run if called directly
if (require.main === module) {
    seedPuzzles().then(() => process.exit(0));
}
