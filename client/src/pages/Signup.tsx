import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
                username,
                email,
                password
            });
            login(res.data.token, res.data.user);
            toast.success('Welcome to Logic Knight!');
            navigate('/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Signup failed');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-10 right-20 text-9xl opacity-5 animate-spin-slow">♚</div>
                <div className="absolute bottom-10 left-20 text-9xl opacity-5 animate-spin-slow-reverse">♛</div>
                <div className="absolute top-1/2 right-1/3 text-7xl opacity-5 animate-pulse">♞</div>
                <div className="absolute top-1/4 left-1/3 text-7xl opacity-5 animate-pulse">♜</div>
            </div>

            {/* Signup Card */}
            <div className="relative z-10 w-full max-w-md">
                <div className="bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-700/50">
                    {/* Logo/Title */}
                    <div className="text-center mb-8">
                        <div className="text-6xl mb-4 animate-bounce-slow">♚</div>
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-600 mb-2">
                            Join Logic Knight
                        </h1>
                        <p className="text-gray-400 text-sm">Begin your strategic journey</p>
                    </div>

                    {/* Signup Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 transition"
                                placeholder="Choose a username"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 transition"
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 transition"
                                placeholder="Create a password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                        >
                            Create Account
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-400 text-sm">
                            Already have an account?{' '}
                            <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition">
                                Login
                            </Link>
                        </p>
                    </div>

                    {/* Decorative Elements */}
                    <div className="mt-8 flex justify-center gap-4 text-4xl opacity-20">
                        <span className="animate-pulse">♔</span>
                        <span className="animate-pulse delay-100">♕</span>
                        <span className="animate-pulse delay-200">♖</span>
                        <span className="animate-pulse delay-300">♗</span>
                        <span className="animate-pulse delay-400">♘</span>
                        <span className="animate-pulse delay-500">♙</span>
                    </div>
                </div>

                {/* Bottom Text */}
                <p className="text-center mt-6 text-gray-500 text-sm">
                    © 2024 Logic Knight. Every move counts.
                </p>
            </div>

            <style>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes spin-slow-reverse {
                    from { transform: rotate(360deg); }
                    to { transform: rotate(0deg); }
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-spin-slow {
                    animation: spin-slow 20s linear infinite;
                }
                .animate-spin-slow-reverse {
                    animation: spin-slow-reverse 25s linear infinite;
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

export default Signup;
