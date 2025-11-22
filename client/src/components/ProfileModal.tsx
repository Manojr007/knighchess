import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'stats'>('profile');
    const [profile, setProfile] = useState({ avatar: '♞', bio: '', country: '' });
    const [stats, setStats] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (isOpen && user) {
            loadProfile();
            loadStats();
        }
    }, [isOpen, user]);

    const loadProfile = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/profile/${user?._id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setProfile({
                avatar: res.data.profile?.avatar || '♞',
                bio: res.data.profile?.bio || '',
                country: res.data.profile?.country || ''
            });
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    };

    const loadStats = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/profile/stats/me`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setStats(res.data);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const saveProfile = async () => {
        try {
            await axios.put(
                `${import.meta.env.VITE_API_URL}/api/profile`,
                profile,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                }
            );
            toast.success('Profile updated!');
            setIsEditing(false);
        } catch (error) {
            toast.error('Failed to update profile');
        }
    };

    const chessIcons = ['♔', '♕', '♖', '♗', '♘', '♙', '♞', '♟'];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-700 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-gray-700">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-blue-400">Profile</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white text-2xl"
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-700">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex-1 py-3 font-semibold ${activeTab === 'profile'
                            ? 'text-blue-400 border-b-2 border-blue-400'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('stats')}
                        className={`flex-1 py-3 font-semibold ${activeTab === 'stats'
                            ? 'text-blue-400 border-b-2 border-blue-400'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Statistics
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            {/* Avatar Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Avatar
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                    {chessIcons.map((icon) => (
                                        <button
                                            key={icon}
                                            onClick={() => setProfile({ ...profile, avatar: icon })}
                                            className={`text-4xl p-2 rounded-lg border-2 ${profile.avatar === icon
                                                ? 'border-blue-500 bg-blue-500/20'
                                                : 'border-gray-600 hover:border-gray-500'
                                                }`}
                                            disabled={!isEditing}
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Bio */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Bio
                                </label>
                                <textarea
                                    value={profile.bio}
                                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                    disabled={!isEditing}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white disabled:opacity-50"
                                    rows={3}
                                    placeholder="Tell us about yourself..."
                                />
                            </div>

                            {/* Country */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Country
                                </label>
                                <input
                                    type="text"
                                    value={profile.country}
                                    onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                                    disabled={!isEditing}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white disabled:opacity-50"
                                    placeholder="Your country"
                                />
                            </div>

                            {/* User Info */}
                            <div className="pt-4 border-t border-gray-700">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-400">Username:</span>
                                        <span className="ml-2 text-white font-semibold">{user?.username}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Email:</span>
                                        <span className="ml-2 text-white font-semibold">{user?.email}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={saveProfile}
                                            className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition"
                                        >
                                            Save Changes
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsEditing(false);
                                                loadProfile();
                                            }}
                                            className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition"
                                    >
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'stats' && stats && (
                        <div className="space-y-6">
                            {/* Game Stats */}
                            <div>
                                <h3 className="text-lg font-bold text-blue-400 mb-4">Game Statistics</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-700/50 p-4 rounded-lg">
                                        <div className="text-3xl font-bold text-white">{stats.rating}</div>
                                        <div className="text-sm text-gray-400">Rating</div>
                                    </div>
                                    <div className="bg-gray-700/50 p-4 rounded-lg">
                                        <div className="text-3xl font-bold text-white">{stats.gamesPlayed}</div>
                                        <div className="text-sm text-gray-400">Games Played</div>
                                    </div>
                                    <div className="bg-green-900/30 p-4 rounded-lg border border-green-700">
                                        <div className="text-3xl font-bold text-green-400">{stats.wins}</div>
                                        <div className="text-sm text-gray-400">Wins</div>
                                    </div>
                                    <div className="bg-red-900/30 p-4 rounded-lg border border-red-700">
                                        <div className="text-3xl font-bold text-red-400">{stats.losses}</div>
                                        <div className="text-sm text-gray-400">Losses</div>
                                    </div>
                                    <div className="bg-gray-700/50 p-4 rounded-lg">
                                        <div className="text-3xl font-bold text-white">{stats.draws}</div>
                                        <div className="text-sm text-gray-400">Draws</div>
                                    </div>
                                    <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700">
                                        <div className="text-3xl font-bold text-blue-400">{stats.winRate}%</div>
                                        <div className="text-sm text-gray-400">Win Rate</div>
                                    </div>
                                </div>
                            </div>

                            {/* Puzzle Stats */}
                            <div>
                                <h3 className="text-lg font-bold text-purple-400 mb-4">Puzzle Statistics</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-700/50 p-4 rounded-lg">
                                        <div className="text-3xl font-bold text-white">{stats.puzzleRating}</div>
                                        <div className="text-sm text-gray-400">Puzzle Rating</div>
                                    </div>
                                    <div className="bg-gray-700/50 p-4 rounded-lg">
                                        <div className="text-3xl font-bold text-white">{stats.puzzlesSolved}</div>
                                        <div className="text-sm text-gray-400">Puzzles Solved</div>
                                    </div>
                                    <div className="bg-gray-700/50 p-4 rounded-lg col-span-2">
                                        <div className="text-3xl font-bold text-white">{stats.puzzlesAttempted}</div>
                                        <div className="text-sm text-gray-400">Puzzles Attempted</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
