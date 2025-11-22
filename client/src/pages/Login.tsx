import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
                email,
                password
            });
            login(res.data.token, res.data.user);
            toast.success('Welcome back!');
            navigate('/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 left-10 text-9xl opacity-5 animate-float">♞</div>
                <div className="absolute bottom-20 right-10 text-9xl opacity-5 animate-float-delayed">♜</div>
                <div className="absolute top-1/2 left-1/4 text-7xl opacity-5 animate-pulse">♝</div>
                <div className="absolute top-1/3 right-1/4 text-7xl opacity-5 animate-pulse">♛</div>
            </div>

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md">
                <div className="bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-700/50">
                    {/* Logo/Title */}
                    <div className="text-center mb-8">
                        <div className="text-6xl mb-4 animate-bounce-slow">♞</div>
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-2">
                            Logic Knight
                        </h1>
                        <p className="text-gray-400 text-sm">Master the art of strategic thinking</p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition"
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
                                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition"
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                        >
                            Login
                        </button>
                    </form>

                    {/* Signup Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-400 text-sm">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-semibold transition">
                                Sign up
                            </Link>
                        </p>
                    </div>

                    {/* Decorative Elements */}
                    <div className="mt-8 flex justify-center gap-4 text-4xl opacity-20">
                        <span className="animate-pulse">♟</span>
                        <span className="animate-pulse delay-100">♞</span>
                        <span className="animate-pulse delay-200">♝</span>
                        <span className="animate-pulse delay-300">♜</span>
                        <span className="animate-pulse delay-400">♛</span>
                        <span className="animate-pulse delay-500">♚</span>
                    </div>
                </div>

                {/* Bottom Text */}
                <p className="text-center mt-6 text-gray-500 text-sm">
                    © 2024 Logic Knight. Think strategically, play brilliantly.
                </p>
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
                    50% { transform: translateY(-10px); }
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

export default Login;
