import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-10 text-9xl opacity-10 animate-float">♞</div>
                    <div className="absolute bottom-20 right-10 text-9xl opacity-10 animate-float-delayed">♜</div>
                    <div className="absolute top-1/2 left-1/4 text-7xl opacity-10 animate-pulse">♝</div>
                    <div className="absolute top-1/3 right-1/4 text-7xl opacity-10 animate-pulse">♛</div>
                </div>

                {/* Content */}
                <div className="relative z-10 container mx-auto px-4 py-20">
                    {/* Header */}
                    <nav className="flex justify-between items-center mb-20">
                        <div className="flex items-center gap-3">
                            <span className="text-5xl">♞</span>
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                                Logic Knight
                            </h1>
                        </div>
                        <div className="flex gap-4">
                            <Link
                                to="/login"
                                className="px-6 py-2 border-2 border-blue-500 rounded-lg hover:bg-blue-500/20 transition font-semibold"
                            >
                                Login
                            </Link>
                            <Link
                                to="/signup"
                                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition font-semibold shadow-lg"
                            >
                                Sign Up
                            </Link>
                        </div>
                    </nav>

                    {/* Hero Content */}
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="text-8xl mb-8 animate-bounce-slow">♚</div>
                        <h2 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                            Master the Art of Strategy
                        </h2>
                        <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
                            Challenge players worldwide, compete against AI opponents, and sharpen your tactical skills in the ultimate chess experience.
                        </p>
                        <Link
                            to="/signup"
                            className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 font-bold text-lg shadow-2xl"
                        >
                            Start Playing Now
                        </Link>
                    </div>

                    {/* Features */}
                    <div className="grid md:grid-cols-3 gap-8 mt-20">
                        <div className="bg-gray-800/50 backdrop-blur-xl p-8 rounded-xl border border-gray-700/50 hover:border-blue-500/50 transition">
                            <div className="text-5xl mb-4">⚔️</div>
                            <h3 className="text-2xl font-bold mb-3 text-blue-400">Play Online</h3>
                            <p className="text-gray-400">
                                Instant matchmaking with players of similar skill. Real-time gameplay with multiple time controls.
                            </p>
                        </div>

                        <div className="bg-gray-800/50 backdrop-blur-xl p-8 rounded-xl border border-gray-700/50 hover:border-purple-500/50 transition">
                            <div className="text-5xl mb-4">🤖</div>
                            <h3 className="text-2xl font-bold mb-3 text-purple-400">AI Opponents</h3>
                            <p className="text-gray-400">
                                Train against bots from beginner to Stockfish engine. Perfect your strategies at your own pace.
                            </p>
                        </div>

                        <div className="bg-gray-800/50 backdrop-blur-xl p-8 rounded-xl border border-gray-700/50 hover:border-pink-500/50 transition">
                            <div className="text-5xl mb-4">📊</div>
                            <h3 className="text-2xl font-bold mb-3 text-pink-400">Track Progress</h3>
                            <p className="text-gray-400">
                                Analyze your games, review move history, and watch your skills improve over time.
                            </p>
                        </div>
                    </div>

                    {/* Chess Pieces Decoration */}
                    <div className="mt-20 flex justify-center gap-8 text-6xl opacity-30">
                        <span className="animate-pulse">♔</span>
                        <span className="animate-pulse delay-100">♕</span>
                        <span className="animate-pulse delay-200">♖</span>
                        <span className="animate-pulse delay-300">♗</span>
                        <span className="animate-pulse delay-400">♘</span>
                        <span className="animate-pulse delay-500">♙</span>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                @keyframes float-delayed {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-30px); }
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-15px); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                .animate-float-delayed {
                    animation: float-delayed 8s ease-in-out infinite;
                }
                .animate-bounce-slow {
                    animation: bounce-slow 3s ease-in-out infinite;
                }
                .delay-100 { animation-delay: 0.1s; }
                .delay-200 { animation-delay: 0.2s; }
                .delay-300 { animation-delay: 0.3s; }
                .delay-400 { animation-delay: 0.4s; }
                .delay-500 { animation-delay: 0.5s; }
            `}</style>
        </div>
    );
};

export default Home;
