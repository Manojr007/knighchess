import React from 'react';

interface ProfileIconProps {
    avatar: string;
    onClick: () => void;
}

const ProfileIcon: React.FC<ProfileIconProps> = ({ avatar, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-2xl hover:scale-110 transition-transform shadow-lg border-2 border-gray-700 hover:border-blue-500"
            title="View Profile"
        >
            {avatar}
        </button>
    );
};

export default ProfileIcon;
