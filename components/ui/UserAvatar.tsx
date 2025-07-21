
import React from 'react';

interface UserAvatarProps {
  name: string;
  className?: string;
}

const colors = [
  'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500', 
  'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 
  'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500', 
  'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'
];

const getInitials = (name: string) => {
    const words = name.split(' ');
    if (words.length > 1) {
        return `${words[0][0]}${words[words.length - 1][0]}`;
    }
    return name.substring(0, 2);
};

const UserAvatar: React.FC<UserAvatarProps> = ({ name, className = '' }) => {
  const initials = getInitials(name || '?').toUpperCase();
  const charCodeSum = (name || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const color = colors[charCodeSum % colors.length];

  return (
    <div className={`w-full h-full rounded-full flex items-center justify-center font-bold text-white text-sm ${color} ${className}`}>
      {initials}
    </div>
  );
};

export default UserAvatar;
