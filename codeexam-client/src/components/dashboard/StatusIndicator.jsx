import React from 'react';
import { CheckCircle, HelpCircle } from 'lucide-react';

export const StatusIndicator = ({ solved }) => (
  <div className="flex items-center">
    {solved ? (
      <div className="flex items-center text-green-600">
        <CheckCircle size={16} className="mr-1" />
        <span className="text-sm">Solved</span>
      </div>
    ) : (
      <div className="flex items-center text-gray-400">
        <HelpCircle size={16} className="mr-1" />
        <span className="text-sm">Unsolved</span>
      </div>
    )}
  </div>
);

export default StatusIndicator;