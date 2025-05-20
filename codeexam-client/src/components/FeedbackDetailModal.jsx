import React from 'react';
import { 
  X, 
  Star, 
  Mail, 
  Calendar, 
  MessageSquare, 
  Check, 
  Clock, 
  Eye, 
  Trash2, 
  User 
} from 'lucide-react';
import { Button } from '../components/Button';

const FeedbackDetailModal = ({ feedback, isOpen, onClose, onUpdateStatus, onDelete }) => {
  if (!isOpen || !feedback) return null;
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Render stars for rating
  const renderRatingStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={18}
            className={star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
          />
        ))}
        <span className="ml-2 text-gray-700 font-medium">{rating}/5</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
            Feedback Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left column - metadata */}
            <div className="space-y-6">
              <div>
                <h4 className="text-xs uppercase text-gray-500 font-medium mb-2">Status</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => onUpdateStatus('unread')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center ${
                      feedback.status === 'unread'
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Clock size={14} className="mr-1.5" />
                    Unread
                  </button>
                  <button
                    onClick={() => onUpdateStatus('read')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center ${
                      feedback.status === 'read'
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Eye size={14} className="mr-1.5" />
                    Read
                  </button>
                  <button
                    onClick={() => onUpdateStatus('addressed')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center ${
                      feedback.status === 'addressed'
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Check size={14} className="mr-1.5" />
                    Addressed
                  </button>
                </div>
              </div>
              
              <div>
                <h4 className="text-xs uppercase text-gray-500 font-medium mb-2">Category</h4>
                <p className="text-sm font-medium text-gray-900 bg-gray-100 py-1.5 px-3 rounded-md inline-block">
                  {feedback.category}
                </p>
              </div>
              
              <div>
                <h4 className="text-xs uppercase text-gray-500 font-medium mb-2">Rating</h4>
                {renderRatingStars(feedback.rating)}
              </div>
              
              <div>
                <h4 className="text-xs uppercase text-gray-500 font-medium mb-2">Submitted By</h4>
                <div className="flex items-center">
                  <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                    <User className="h-4 w-4 text-blue-700" />
                  </div>
                  <div>
                    {feedback.is_anonymous ? (
                      <p className="text-sm font-medium text-gray-900">Anonymous User</p>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-gray-900">
                          {feedback.user?.username || 'Unknown User'}
                        </p>
                        {feedback.user?.email && (
                          <p className="text-xs text-gray-500 flex items-center mt-0.5">
                            <Mail className="h-3 w-3 mr-1" />
                            {feedback.user.email}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-xs uppercase text-gray-500 font-medium mb-2">Date Submitted</h4>
                <p className="text-sm text-gray-900 flex items-center">
                  <Calendar className="h-4 w-4 mr-1.5 text-gray-500" />
                  {formatDate(feedback.created_at)}
                </p>
              </div>
              
              {/* Related items */}
              {feedback.problem && (
                <div>
                  <h4 className="text-xs uppercase text-gray-500 font-medium mb-2">Related Problem</h4>
                  <p className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                    {feedback.problem.title}
                  </p>
                </div>
              )}
              
              {feedback.competition && (
                <div>
                  <h4 className="text-xs uppercase text-gray-500 font-medium mb-2">Related Competition</h4>
                  <p className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                    {feedback.competition.name}
                  </p>
                </div>
              )}
            </div>
            
            {/* Right column - content */}
            <div className="md:col-span-2">
              <h4 className="text-xs uppercase text-gray-500 font-medium mb-2">Feedback Content</h4>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-gray-900 whitespace-pre-wrap">
                {feedback.content}
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <Button
            onClick={onDelete}
            variant="danger"
            className="flex items-center"
          >
            <Trash2 size={16} className="mr-2" />
            Delete Feedback
          </Button>
          
          <Button
            onClick={onClose}
            variant="secondary"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackDetailModal;