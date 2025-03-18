import React, { useState, useEffect } from 'react';

const CompetitionTimer = ({ competition }) => {
  const [timeRemaining, setTimeRemaining] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const startTime = new Date(competition.start_time);
      const endTime = new Date(competition.end_time);

      if (now < startTime) {
        const diff = startTime - now;
        setTimeRemaining(formatTime(diff));
        setStatus('upcoming');
      } else if (now >= startTime && now <= endTime) {
        const diff = endTime - now;
        setTimeRemaining(formatTime(diff));
        setStatus('active');
      } else {
        setTimeRemaining('Competition ended');
        setStatus('ended');
      }
    };

    calculateTimeRemaining();
    const timer = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(timer);
  }, [competition]);

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const statusColors = {
    'upcoming': 'bg-blue-500',
    'active': 'bg-green-500',
    'ended': 'bg-gray-500'
  };

  const statusText = {
    'upcoming': 'Starting in:',
    'active': 'Time remaining:',
    'ended': ''
  };

  return (
    <div className="flex flex-col items-center">
      <div className={`${statusColors[status]} text-white text-xs font-medium px-2.5 py-1 rounded-full mb-2`}>
        {status === 'upcoming' ? 'Upcoming' : status === 'active' ? 'Active' : 'Ended'}
      </div>

      <p className="text-sm text-gray-500">{statusText[status]}</p>
      <p className="text-xl font-bold tracking-tight">{timeRemaining}</p>
    </div>
  );
};

export default CompetitionTimer;