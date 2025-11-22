import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import toast from 'react-hot-toast';
import axios from 'axios';

interface PuzzleBoardProps {
    puzzle?: any;
    onComplete: () => void;
    onClose?: () => void; // Dashboard passes onClose too
}

const PuzzleBoard: React.FC<PuzzleBoardProps> = ({ puzzle, onComplete, onClose }) => {
    const [game, setGame] = useState(new Chess());
    const [puzzleData, setPuzzleData] = useState<any>(null);
    const [userMoves, setUserMoves] = useState<string[]>([]);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        if (puzzle) {
            setPuzzleData(puzzle);
            const newGame = new Chess(puzzle.fen);
            setGame(newGame);
            setUserMoves([]);
            setIsComplete(false);
        } else {
            loadPuzzle();
        }
    }, [puzzle]);

    const loadPuzzle = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/puzzles/random`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            setPuzzleData(res.data);
            const newGame = new Chess(res.data.fen);
            setGame(newGame);
            setUserMoves([]);
            setIsComplete(false);
        } catch (error) {
            toast.error('Failed to load puzzle');
        }
    };

    const onDrop = (sourceSquare: string, targetSquare: string) => {
        if (isComplete) return false;

        const move = game.move({
            from: sourceSquare,
            to: targetSquare,
            promotion: 'q',
        });

        if (move === null) return false;

        const newMoves = [...userMoves, `${sourceSquare}${targetSquare}`];
        setUserMoves(newMoves);
        setGame(new Chess(game.fen()));

        return true;
    };

    const checkSolution = async () => {
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/puzzles/check`,
                {
                    puzzleId: puzzleData.puzzleId,
                    moves: userMoves
                },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                }
            );

            if (res.data.correct) {
                toast.success('🎉 Correct! Well done!');
                setIsComplete(true);
                setTimeout(() => {
                    onComplete();
                    loadPuzzle();
                }, 2000);
            } else {
                toast.error('Not quite right. Try again!');
                // Reset to puzzle start
                const newGame = new Chess(puzzleData.fen);
                setGame(newGame);
                setUserMoves([]);
            }
        } catch (error) {
            toast.error('Failed to check solution');
        }
    };

    if (!puzzleData) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin text-4xl">♞</div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-2xl max-w-lg w-full">
                <div className="mb-4 flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold text-blue-400 mb-2">Chess Puzzle</h3>
                        <div className="flex gap-4 text-sm text-gray-400">
                            <span>Rating: {puzzleData.rating}</span>
                            <span>Themes: {puzzleData.themes.join(', ')}</span>
                        </div>
                    </div>
                    {onClose && (
                        <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">
                            ×
                        </button>
                    )}
                </div>

                <div className="mb-4 flex justify-center">
                    <Chessboard
                        position={game.fen()}
                        onPieceDrop={onDrop}
                        boardWidth={400}
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={checkSolution}
                        disabled={userMoves.length === 0 || isComplete}
                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-lg transition"
                    >
                        Check Solution
                    </button>
                    <button
                        onClick={loadPuzzle}
                        className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition"
                    >
                        New Puzzle
                    </button>
                </div>

                {userMoves.length > 0 && (
                    <div className="mt-4 text-sm text-gray-400">
                        Moves: {userMoves.join(', ')}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PuzzleBoard;
