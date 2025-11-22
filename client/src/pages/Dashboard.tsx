import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';
import SearchingModal from '../components/SearchingModal';
import ProfileIcon from '../components/ProfileIcon';
import ProfileModal from '../components/ProfileModal';
import PuzzleBoard from '../components/PuzzleBoard';

interface Game {
    _id: string;
    white: { username: string };
    black: { username: string };
    status: string;
    result: string;
}

const Dashboard = () => {
    const { user, logout } = useAuth();
    const socket = useSocket();
    const [games, setGames] = useState<Game[]>([]);
    const [customTime, setCustomTime] = useState('10');
    const [customIncrement, setCustomIncrement] = useState('0');
    const [selectedColor, setSelectedColor] = useState('random');
    const [isSearching, setIsSearching] = useState(false);
    const [searchingTimeControl, setSearchingTimeControl] = useState('');
    const [showProfile, setShowProfile] = useState(false);
    const [showPuzzle, setShowPuzzle] = useState(false);
    const [currentPuzzle, setCurrentPuzzle] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchGames();
        if (socket) {
            socket.on('match_found', (data: { gameId: string; color: string }) => {
                setIsSearching(false);
                toast.success('Match found!');
                navigate(`/game/${data.gameId}`);
            });
            socket.on('searching', () => {
                console.log('Searching for opponent...');
            });
            socket.on('search_cancelled', () => {
                setIsSearching(false);
                toast.success('Search cancelled');
            });
            return () => {
                socket.off('match_found');
                socket.off('searching');
                socket.off('search_cancelled');
            };
        }
    }, [socket, navigate]);

    const fetchGames = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/games/my`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setGames(res.data);
        } catch (error) {
            console.error('Error fetching games:', error);
            toast.error('Failed to fetch games.');
        }
    };

    const startMatchmaking = (timeControl: string) => {
        if (!socket || !user) return;
        setIsSearching(true);
        setSearchingTimeControl(timeControl);
        socket.emit('search_match', {
            userId: user._id,
            timeControl,
            color: selectedColor,
        });
    };

    const fetchRandomPuzzle = async (theme?: string) => {
        try {
            const url = theme
                ? `${import.meta.env.VITE_API_URL}/api/puzzles/random?theme=${theme}`
                : `${import.meta.env.VITE_API_URL}/api/puzzles/random`;

            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setCurrentPuzzle(res.data);
            setShowPuzzle(true);
        } catch (error) {
            console.error('Error fetching puzzle:', error);
            toast.error('Failed to load puzzle');
        }
    };

    const cancelSearch = () => {
        if (!socket || !user) return;
        socket.emit('cancel_search', { userId: user._id });
        setIsSearching(false);
    };

    const createGame = async (timeControl: string, isBot: boolean = false, botLevel?: string) => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/games`, {
                timeControl,
                isBot,
                botLevel,
                color: selectedColor,
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            toast.success('Game created!');
            navigate(`/game/${res.data._id}`);
        } catch (error) {
            console.error('Error creating game:', error);
            toast.error('Failed to create game.');
        }
    };

    const handleCustomGame = (isBot: boolean = false, botLevel?: string) => {
        const timeControl = `${customTime}+${customIncrement}`;
        createGame(timeControl, isBot, botLevel);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                        Logic Knight - Welcome, {user?.username}
                    </h1>
                    <div className="flex items-center gap-4">
                        <ProfileIcon avatar={user?.profile?.avatar || '♞'} onClick={() => setShowProfile(true)} />
                        <button onClick={logout} className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition shadow-lg">
                            Logout
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Create Game Section */}
                    <div className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700">
                        <h2 className="text-xl font-bold mb-4 text-blue-400">Create Game</h2>

                        {/* Color Selection */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Choose Color</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSelectedColor('white')}
                                    className={`flex-1 py-2 rounded border ${selectedColor === 'white' ? 'bg-gray-200 text-black border-white' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'}`}
                                >
                                    White
                                </button>
                                <button
                                    onClick={() => setSelectedColor('random')}
                                    className={`flex-1 py-2 rounded border ${selectedColor === 'random' ? 'bg-blue-600 border-blue-500' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'}`}
                                >
                                    Random
                                </button>
                                <button
                                    onClick={() => setSelectedColor('black')}
                                    className={`flex-1 py-2 rounded border ${selectedColor === 'black' ? 'bg-black border-gray-500' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'}`}
                                >
                                    Black
                                </button>
                            </div>
                        </div>

                        <h3 className="font-semibold mb-2 text-gray-300">Play Online (1v1)</h3>
                        <div className="grid grid-cols-3 gap-2 mb-6">
                            <button onClick={() => startMatchmaking('1+0')} className="py-2 bg-blue-700 hover:bg-blue-600 rounded transition text-sm font-bold">Bullet 1+0</button>
                            <button onClick={() => startMatchmaking('3+2')} className="py-2 bg-blue-700 hover:bg-blue-600 rounded transition text-sm font-bold">Blitz 3+2</button>
                            <button onClick={() => startMatchmaking('10+0')} className="py-2 bg-blue-700 hover:bg-blue-600 rounded transition text-sm font-bold">Rapid 10+0</button>
                            <button onClick={() => startMatchmaking('10+0')} className="py-2 bg-blue-700 hover:bg-blue-600 rounded transition text-sm font-bold">Rapid 10+0</button>
                        </div>

                        <h3 className="font-semibold mb-2 text-gray-300">Training</h3>
                        <div className="grid grid-cols-3 gap-2 mb-6">
                            <button onClick={() => fetchRandomPuzzle()} className="py-2 bg-purple-700 hover:bg-purple-600 rounded transition text-sm font-bold">Random</button>
                            <button onClick={() => fetchRandomPuzzle('mateIn1')} className="py-2 bg-purple-700 hover:bg-purple-600 rounded transition text-sm font-bold">Mate in 1</button>
                            <button onClick={() => fetchRandomPuzzle('mateIn2')} className="py-2 bg-purple-700 hover:bg-purple-600 rounded transition text-sm font-bold">Mate in 2</button>
                        </div>

                        <h3 className="font-semibold mb-2 text-gray-300">Play vs Bot</h3>
                        <div className="grid grid-cols-3 gap-2 mb-6">
                            <button onClick={() => createGame('10+0', true, 'random')} className="py-2 bg-green-600 hover:bg-green-700 rounded transition text-sm">Random</button>
                            <button onClick={() => createGame('10+0', true, 'medium')} className="py-2 bg-yellow-600 hover:bg-yellow-700 rounded transition text-sm">Medium</button>
                            <button onClick={() => createGame('10+0', true, 'hard')} className="py-2 bg-red-600 hover:bg-red-700 rounded transition text-sm">Stockfish</button>
                        </div>

                        <h3 className="font-semibold mb-2 text-gray-300">Custom Game</h3>
                        <div className="flex gap-2 mb-4">
                            <div className="flex-1">
                                <label className="text-xs text-gray-400">Minutes</label>
                                <input
                                    type="number"
                                    value={customTime}
                                    onChange={(e) => setCustomTime(e.target.value)}
                                    className="w-full bg-gray-700 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-gray-400">Increment (s)</label>
                                <input
                                    type="number"
                                    value={customIncrement}
                                    onChange={(e) => setCustomIncrement(e.target.value)}
                                    className="w-full bg-gray-700 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <button onClick={() => handleCustomGame()} className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold transition">
                            Create Custom Game
                        </button>
                    </div>

                    {/* Active Games Section */}
                    <div className="md:col-span-2 bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700">
                        <h2 className="text-xl font-bold mb-4 text-blue-400">Your Games</h2>
                        {games.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <p>No active games found.</p>
                                <p className="text-sm">Create a game to get started!</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {games.map((game) => (
                                    <div key={game._id} className="flex justify-between items-center bg-gray-700/50 p-4 rounded-lg hover:bg-gray-700 transition cursor-pointer border border-gray-600" onClick={() => navigate(`/game/${game._id}`)}>
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col items-end">
                                                <span className="font-bold text-white">{game.white?.username || 'Bot'}</span>
                                                <span className="text-xs text-gray-400">White</span>
                                            </div>
                                            <span className="text-gray-400 font-mono">vs</span>
                                            <div className="flex flex-col items-start">
                                                <span className="font-bold text-white">{game.black?.username || 'Bot'}</span>
                                                <span className="text-xs text-gray-400">Black</span>
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${game.status === 'active' ? 'bg-green-900 text-green-300' : 'bg-gray-600 text-gray-300'}`}>{game.status.toUpperCase()}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Puzzle Modal */}
                {showPuzzle && currentPuzzle && (
                    <PuzzleBoard
                        puzzle={currentPuzzle}
                        onClose={() => setShowPuzzle(false)}
                        onComplete={() => setShowPuzzle(false)}
                    />
                )}

                {/* Profile Modal */}
                {showProfile && (
                    <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} />
                )}

                {/* Searching Modal */}
                {isSearching && (
                    <SearchingModal timeControl={searchingTimeControl} onCancel={cancelSearch} />
                )}
            </div>
        </div>
    );
};

export default Dashboard;
