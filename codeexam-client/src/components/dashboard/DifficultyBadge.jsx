import React from 'react';

export const DifficultyBadge = ({ difficulty }) => {
  const styles = {
    Easy: 'bg-green-100 text-green-800 border-green-200',
    Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Hard: 'bg-red-100 text-red-800 border-red-200'
  };

  return (
    <span className={`${styles[difficulty]} text-xs px-2.5 py-0.5 rounded-full border inline-flex items-center justify-center font-medium`}>
      {difficulty}
    </span>
  );
};

export default DifficultyBadge;