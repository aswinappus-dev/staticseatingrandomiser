
import React from 'react';

interface InfoCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, value, icon }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4 transition-transform hover:scale-105">
      <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
};

export default InfoCard;
