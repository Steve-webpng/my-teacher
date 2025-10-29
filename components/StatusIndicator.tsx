
import React from 'react';
import type { SessionStatus } from '../types';

interface StatusIndicatorProps {
  status: SessionStatus;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'connected':
        return {
          bgColor: 'bg-green-500',
          text: 'Connected - You can talk now',
        };
      case 'connecting':
        return {
          bgColor: 'bg-yellow-500',
          text: 'Connecting...',
        };
      case 'error':
        return {
          bgColor: 'bg-red-500',
          text: 'Error - Please try again',
        };
      case 'disconnected':
      default:
        return {
          bgColor: 'bg-gray-500',
          text: 'Disconnected',
        };
    }
  };

  const { bgColor, text } = getStatusStyle();

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-900 bg-opacity-50 min-w-[250px] justify-center">
      <div className={`w-4 h-4 rounded-full ${bgColor} animate-pulse`}></div>
      <span className="font-medium text-slate-300">{text}</span>
    </div>
  );
};
