import { Check, X, ClockIcon } from 'lucide-react';

const getStatusBadgeColor = (status) => {
  switch (status?.toUpperCase()) {
    case 'ACCEPTED':
      return 'bg-green-100 text-green-800';
    case 'REJECTED':
      return 'bg-red-100 text-red-800';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'PROCESSING':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status) => {
  switch (status?.toUpperCase()) {
    case 'ACCEPTED':
      return <Check className="h-4 w-4 mr-1" />;
    case 'WRONG_ANSWER':
      return <X className="h-4 w-4 mr-1" />;
    case 'PENDING':
    case 'PROCESSING':
      return <ClockIcon className="h-4 w-4 mr-1" />;
    default:
      return null;
  }
};

const StatusBadge = ({ status }) => {
  const colorClass = getStatusBadgeColor(status);
  const icon = getStatusIcon(status);

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${colorClass}`}
    >
      {icon}
      {status}
    </span>
  );
};

export default StatusBadge;
