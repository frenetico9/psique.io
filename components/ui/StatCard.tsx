
import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between relative overflow-hidden">
      <div className="z-10">
        <p className="text-sm font-medium text-gray-500 uppercase">{title}</p>
        <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
      </div>
      <div className={`text-6xl opacity-20 absolute -right-4 -top-2 ${color}`}>
        {icon}
      </div>
       <div className={`p-4 rounded-full bg-opacity-20 ${color.replace('text-', 'bg-')}`}>
         <div className={`text-2xl ${color}`}>{icon}</div>
      </div>
    </div>
  );
};

export default StatCard;
