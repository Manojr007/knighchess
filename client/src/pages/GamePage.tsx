import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Chess, Move } from 'chess.js';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import ChessBoard from '../components/ChessBoard';
import toast from 'react-hot-toast';
import axios from 'axios';

const GamePage = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const socket = useSocket();
    const navigate = useNavigate();

    const [game, setGame] = useState(new Chess());
    const [orientation, setOrientation] = useState<'white' | 'black'>('white');
    const [whiteTime, setWhiteTime] = useState(0);
    const [blackTime, setBlackTime] = useState(0);
    const [gameData, setGameData] = useState<any>(null);
    const [chat, setChat] = useState<{ sender: string; message: string }[]>([]);
    const [message, setMessage] = useState('');
    const [optionSquares, setOptionSquares] = useState({});
    const [moveHistory, setMoveHistory] = useState<string[]>([]);
    const chatEndRef = React.useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chat]);

    // Real-time countdown timer
    useEffect(() => {
        const interval = setInterval(() => {
            if (gameData?.status === 'active') {
                const currentTurn = game.turn();
                if (currentTurn === 'w') {
                    setWhiteTime(prev => Math.max(0, prev - 1000));
                } else {
                    setBlackTime(prev => Math.max(0, prev - 1000));
                }
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [game, gameData?.status]);

    useEffect(() => {
        // Fetch initial game state
        const fetchGame = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/games/${id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                console.log('Game data loaded:', res.data);
                setGameData(res.data);
                if (res.data.chat) {
                    setChat(res.data.chat);
                }
                const newGame = new Chess(res.data.fen);
                setGame(newGame);
                setMoveHistory(res.data.moves || []); // Load moves from database
                console.log('Initial move history:', res.data.moves);

                // Determine orientation
                if (user && res.data.black && res.data.black._id === user._id) {
                    setOrientation('black');
                } else if (user && res.data.white && res.data.white._id === user._id) {
                    setOrientation('white');
                }
            } catch (error) {
                console.error(error);
                toast.error('Failed to load game');
                navigate('/dashboard');
            }
        };

        fetchGame();

        if (socket) {
            socket.emit('join_game', id);
            console.log('Joined game:', id);

            socket.on('move', (data: any) => {
                console.log('Received move event:', data);
                const newGame = new Chess(data.fen);
                setGame(newGame);
                setMoveHistory(data.moves || []); // Use moves from server
                setWhiteTime(data.whiteTime);
                setBlackTime(data.blackTime);
                setOptionSquares({});
                console.log('Updated move history:', data.moves);
            });

            socket.on('receive_message', (data: { sender: string; message: string }) => {
                setChat((prev) => [...prev, data]);
            });

            socket.on('gameOver', (data: any) => {
                toast.success(`Game Over! Result: ${data.result}`);
            });

            socket.on('error', (msg: string) => {
                console.error('Socket error:', msg);
                toast.error(msg);
            });
        }

        return () => {
            if (socket) {
                socket.off('move');
                socket.off('receive_message');
                socket.off('gameOver');
                socket.off('error');
            }
        };
    }, [id, socket, user, navigate]);

    const getMoveOptions = (square: string) => {
        const moves = game.moves({
            square: square as any,
            verbose: true,
        }) as Move[];

        if (moves.length === 0) {
            setOptionSquares({});
            return false;
        }

        const newSquares: any = {};
        moves.map((move) => {
            newSquares[move.to] = {
                background:
                    game.get(move.to as any) && game.get(move.to as any).color !== game.get(square as any).color
                        ? 'radial-gradient(circle, rgba(0,0,255,.8) 85%, transparent 85%)'
                        : 'radial-gradient(circle, rgba(0,0,255,.5) 25%, transparent 25%)',
                borderRadius: '50%',
            };
            return move;
        });
        newSquares[square] = {
            background: 'rgba(0, 150, 255, 0.4)',
        };
        setOptionSquares(newSquares);
        return true;
    };

    const onMove = (sourceSquare: string, targetSquare: string) => {
        console.log('onMove called:', { sourceSquare, targetSquare, userId: user?._id });
        const gameCopy = new Chess(game.fen());
        try {
            const move = gameCopy.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: 'q',
            });

            if (move) {
                console.log('Move valid:', move);
                setGame(gameCopy);
                setMoveHistory(gameCopy.history());
                setOptionSquares({});

                if (socket) {
                    console.log('Emitting make_move to server');
                    socket.emit('make_move', {
                        gameId: id,
                        move: { from: sourceSquare, to: targetSquare, promotion: 'q' },
                        userId: user?._id
                    });
                } else {
                    console.error('Socket not connected!');
                }
                return true;
            } else {
                console.log('Move invalid');
            }
        } catch (e) {
            console.error('Move error:', e);
            return false;
        }
        return false;
    };

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim() && socket) {
            socket.emit('send_message', {
                gameId: id,
                message,
                sender: user?.username
            });
            setMessage('');
        }
    };

    const formatTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const isSpectator = gameData && user && gameData.white?._id !== user._id && gameData.black?._id !== user._id;

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-7xl flex flex-col md:flex-row gap-8 justify-center items-start">

                {/* Left Panel: Chat */}
                <div className="hidden md:flex flex-col w-80 gap-4 h-[600px]">
                    <div className="bg-gray-800 rounded-xl shadow-xl flex flex-col h-full border border-gray-700 overflow-hidden">
                        <div className="p-3 bg-gray-700 font-bold border-b border-gray-600">Chat Room</div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {chat.map((msg, i) => (
                                <div key={i} className="text-sm">
                                    <span className="font-bold text-blue-400">{msg.sender}: </span>
                                    <span className="text-gray-300">{msg.message}</span>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                        <form onSubmit={sendMessage} className="p-3 bg-gray-750 border-t border-gray-700 flex gap-2">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full bg-gray-900 text-white px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                                placeholder="Message..."
                            />
                            <button type="submit" className="bg-blue-600 px-3 py-2 rounded hover:bg-blue-700 transition text-sm font-bold">Send</button>
                        </form>
                    </div>
                </div>

                {/* Middle Panel: Board and Players */}
                <div className="flex flex-col gap-4 items-center">
                    {/* Opponent Card */}
                    <div className="flex items-center justify-between w-full max-w-[600px] bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center font-bold text-lg">
                                {(orientation === 'white' ? (gameData?.black?.username || 'Bot') : (gameData?.white?.username || 'Bot'))?.[0]?.toUpperCase()}
                            </div>
                            <div>
                                <div className="font-bold">{orientation === 'white' ? (gameData?.black?.username || 'Bot') : (gameData?.white?.username || 'Bot')}</div>
                                <div className="text-xs text-gray-400">Rating: 1200</div>
                            </div>
                        </div>
                        <div className={`text-2xl font-mono font-bold px-4 py-1 rounded ${(orientation === 'white' ? blackTime : whiteTime) < 30000 ? 'bg-red-900 text-red-200' : 'bg-gray-700'
                            }`}>
                            {formatTime(orientation === 'white' ? blackTime : whiteTime)}
                        </div>
                    </div>

                    {/* Board */}
                    <div className="relative shadow-2xl border-8 border-gray-800 rounded-lg overflow-hidden">
                        {isSpectator && (
                            <div className="absolute top-2 right-2 bg-yellow-600 text-white px-2 py-1 rounded text-xs font-bold z-10 shadow">
                                SPECTATING
                            </div>
                        )}
                        <div className="w-[85vw] h-[85vw] md:w-[600px] md:h-[600px]">
                            <ChessBoard
                                game={game}
                                onMove={onMove}
                                orientation={orientation}
                                customSquareStyles={optionSquares}
                                onPieceDragBegin={(_piece, sourceSquare) => getMoveOptions(sourceSquare)}
                            />
                        </div>
                    </div>

                    {/* Player Card */}
                    <div className="flex items-center justify-between w-full max-w-[600px] bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                                {user?.username?.[0]?.toUpperCase()}
                            </div>
                            <div>
                                <div className="font-bold">{user?.username}</div>
                                <div className="text-xs text-gray-400">Rating: 1200</div>
                            </div>
                        </div>
                        <div className={`text-2xl font-mono font-bold px-4 py-1 rounded ${(orientation === 'white' ? whiteTime : blackTime) < 30000 ? 'bg-red-900 text-red-200' : 'bg-gray-700'
                            }`}>
                            {formatTime(orientation === 'white' ? whiteTime : blackTime)}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Moves & Controls */}
                <div className="w-full md:w-80 flex flex-col gap-4 h-[600px]">
                    <div className="bg-gray-800 rounded-xl shadow-xl flex flex-col flex-1 border border-gray-700 overflow-hidden">
                        <div className="p-3 bg-gray-700 font-bold border-b border-gray-600">Move History</div>
                        <div className="flex-1 overflow-y-auto p-2">
                            {moveHistory.length === 0 ? (
                                <div className="text-center text-gray-500 text-sm mt-4">No moves yet</div>
                            ) : (
                                <div className="grid grid-cols-2 gap-1 text-sm">
                                    {moveHistory.map((move, i) => (
                                        <div key={i} className={`px-2 py-1 rounded ${i % 2 === 0 ? 'bg-gray-700/50 text-gray-300' : 'text-gray-400'}`}>
                                            <span className="text-gray-500 w-6 inline-block">{i % 2 === 0 ? `${Math.floor(i / 2) + 1}.` : ''}</span>
                                            <span className="font-medium">{move}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-gray-800 rounded-xl shadow-xl p-4 border border-gray-700">
                        <button
                            onClick={() => window.open(`${import.meta.env.VITE_API_URL}/api/games/${id}/pgn`, '_blank')}
                            className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                        >
                            <span>Download PGN</span>
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full mt-2 py-3 bg-red-900/50 hover:bg-red-900/80 text-red-200 rounded-lg font-semibold transition"
                        >
                            Resign / Leave
                        </button>
                    </div>

                    {/* Mobile Chat */}
                    <div className="md:hidden bg-gray-800 rounded-xl shadow-xl flex flex-col h-64 border border-gray-700 overflow-hidden">
                        <div className="p-3 bg-gray-700 font-bold border-b border-gray-600">Chat</div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {chat.map((msg, i) => (
                                <div key={i} className="text-xs">
                                    <span className="font-bold text-blue-400">{msg.sender}: </span>
                                    <span className="text-gray-300">{msg.message}</span>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={sendMessage} className="p-2 bg-gray-750 border-t border-gray-700 flex gap-2">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full bg-gray-900 text-white px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                                placeholder="Message..."
                            />
                            <button type="submit" className="bg-blue-600 px-2 py-1 rounded hover:bg-blue-700 transition text-xs font-bold">Send</button>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default GamePage;
