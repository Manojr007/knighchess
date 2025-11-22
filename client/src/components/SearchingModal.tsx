import React from 'react';

interface SearchingModalProps {
    timeControl: string;
    onCancel: () => void;
}

const SearchingModal: React.FC<SearchingModalProps> = ({ timeControl, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full border-2 border-blue-500/30 relative overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 animate-pulse"></div>

                <div className="relative z-10">
                    {/* Spinner */}
                    <div className="flex justify-center mb-6">
                        <div className="relative w-24 h-24">
                            <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
                            <div className="absolute inset-2 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                            <div className="absolute inset-0 flex items-center justify-center text-4xl">♟️</div>
                        </div>
                    </div>

                    {/* Text */}
                    <h2 className="text-2xl font-bold text-center text-white mb-2">
                        Searching for Opponent
                    </h2>
                    <p className="text-center text-gray-400 mb-6">
                        Time Control: <span className="text-blue-400 font-bold">{timeControl}</span>
                    </p>

                    {/* Animated dots */}
                    <div className="flex justify-center gap-2 mb-8">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>

                    {/* Cancel button */}
                    <button
                        onClick={onCancel}
                        className="w-full py-3 bg-red-600/80 hover:bg-red-600 text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105"
                    >
                        Cancel Search
                    </button>

                    {/* Info text */}
                    <p className="text-center text-gray-500 text-sm mt-4">
                        You'll be matched with a player of similar skill
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SearchingModal;
