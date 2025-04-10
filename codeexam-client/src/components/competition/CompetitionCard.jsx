import React from 'react';
import { Calendar, Users, Clock, Edit, Tag, Trophy, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '../Card';
import { Button } from '../Button';

const CompetitionCard = ({ competition, userRole, onView, onEdit }) => {
    // Helper function to determine competition status
    const getCompetitionStatus = () => {
        const now = new Date().getTime();
        const startTime = new Date(competition.start_time).getTime();
        const endTime = new Date(competition.end_time).getTime();

        if (now < startTime) return 'upcoming';
        if (now > endTime) return 'past';
        return 'active';
    };

    // Format date in a readable way
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Get time remaining or time until competition starts
    const getTimeInfo = () => {
        const now = new Date().getTime();
        const startTime = new Date(competition.start_time).getTime();
        const endTime = new Date(competition.end_time).getTime();

        if (now < startTime) {
            const diffTime = Math.abs(startTime - now);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

            if (diffDays > 0) {
                return `Starts in ${diffDays}d ${diffHours}h`;
            }

            const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
            return `Starts in ${diffHours}h ${diffMinutes}m`;
        }

        if (now < endTime) {
            const diffTime = Math.abs(endTime - now);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

            if (diffDays > 0) {
                return `${diffDays}d ${diffHours}h remaining`;
            }

            const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
            return `${diffHours}h ${diffMinutes}m remaining`;
        }

        // Competition has ended
        const diffTime = Math.abs(now - endTime);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 30) {
            const diffMonths = Math.floor(diffDays / 30);
            return `Ended ${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
        }

        if (diffDays > 0) {
            return `Ended ${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
        }

        const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        return `Ended ${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    };

    // Generate status badge with proper styling
    const StatusBadge = () => {
        const status = getCompetitionStatus();
        const statusConfig = {
            upcoming: {
                className: 'bg-blue-100 text-blue-800 border border-blue-200',
                text: 'Upcoming'
            },
            active: {
                className: 'bg-green-100 text-green-800 border border-green-200',
                text: 'Active'
            },
            past: {
                className: 'bg-gray-100 text-gray-800 border border-gray-200',
                text: 'Ended'
            }
        };

        return (
            <span className={`${statusConfig[status].className} text-xs px-2.5 py-0.5 rounded-full inline-flex items-center justify-center font-medium`}>
                {statusConfig[status].text}
            </span>
        );
    };

    // Generate action button based on role and competition status
    const ActionButton = () => {
        const status = getCompetitionStatus();
        let btnText = 'View Details';
        let btnVariant = 'secondary';
        let btnIcon = null;
        let btnAction = onView; // Default action

        if (userRole === 'competitor' || userRole === 'user') {
            if (status === 'upcoming') {
                btnText = competition.isRegistered ? 'Registered' : 'Register';
                btnVariant = competition.isRegistered ? 'success' : 'primary';
                btnIcon = competition.isRegistered ? <CheckCircle size={16} className="mr-2" /> : null;
            } else if (status === 'active') {
                btnText = 'Enter Competition';
                btnVariant = 'primary';
                btnIcon = <Trophy size={16} className="mr-2" />;
                // Keep the onView action which will be enhanced to handle competition entry
            } else if (status === 'past') {
                btnText = 'View Results';
                btnVariant = 'secondary';
                btnIcon = <Trophy size={16} className="mr-2" />;
            }
        } else if (userRole === 'judge') {
            if (status === 'active') {
                btnText = 'Review Submissions';
                btnVariant = competition.pendingSubmissions ? 'warning' : 'secondary';
            }
        } else if (userRole === 'admin') {
            btnText = 'Manage Competition';
            btnVariant = 'secondary';
        }

        return (
            <Button
                onClick={btnAction}
                variant={btnVariant}
                size="sm"
                className={`text-sm px-4 py-2 flex items-center justify-center ${status === 'active' ? 'animate-pulse-subtle' : ''}`}
            >
                {btnIcon}
                {btnText}
            </Button>
        );
    };

    // Generate status indicator line color
    const getStatusColor = () => {
        const status = getCompetitionStatus();
        return {
            upcoming: 'bg-blue-500',
            active: 'bg-green-500',
            past: 'bg-gray-400'
        }[status];
    };

    // Check if competition has registered participants
    const hasParticipants = competition.participants_count && competition.participants_count > 0;

    return (
        <Card className="overflow-hidden flex flex-col h-full shadow-sm hover:shadow-md transition-shadow duration-300 group">
            {/* Status indicator line at top */}
            <div className={`h-2 w-full ${getStatusColor()}`}></div>

            <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <h3
                        className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 cursor-pointer transition-colors line-clamp-2"
                        onClick={onView}
                    >
                        {competition.name}
                    </h3>
                    <StatusBadge />
                </div>

                <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                    {competition.description || 'No description provided.'}
                </p>

                <div className="mt-auto space-y-2.5">
                    <div className="flex items-center text-sm text-gray-600">
                        <Calendar size={16} className="mr-2 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{formatDate(competition.start_time)}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                        <Clock size={16} className="mr-2 text-gray-400 flex-shrink-0" />
                        <span className="font-medium">{getTimeInfo()}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                        <Users size={16} className="mr-2 text-gray-400 flex-shrink-0" />
                        <span>
                            {hasParticipants ? (
                                `${competition.participants_count} participant${competition.participants_count !== 1 ? 's' : ''}`
                            ) : (
                                'No participants yet'
                            )}
                        </span>
                    </div>

                    {/* Display tags if available */}
                    {competition.tags && competition.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                            {competition.tags.slice(0, 3).map((tag, index) => (
                                <span key={index} className="inline-flex text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">
                                    {tag}
                                </span>
                            ))}
                            {competition.tags.length > 3 && (
                                <span className="text-xs text-gray-500 self-center">+{competition.tags.length - 3}</span>
                            )}
                        </div>
                    )}

                    {/* Judge-specific information */}
                    {userRole === 'judge' && competition.pendingSubmissions > 0 && (
                        <div className="bg-yellow-50 p-2 rounded-md text-xs text-yellow-800 flex items-center">
                            <AlertTriangle size={14} className="mr-1" />
                            {competition.pendingSubmissions} pending submissions need review
                        </div>
                    )}

                    <div className="pt-4 mt-2 border-t border-gray-100 flex justify-between items-center">
                        <ActionButton />

                        {userRole === 'admin' && onEdit && (
                            <button
                                onClick={e => {
                                    e.stopPropagation();
                                    onEdit();
                                }}
                                className="p-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                                aria-label="Edit competition"
                                title="Edit competition"
                            >
                                <Edit size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default CompetitionCard;