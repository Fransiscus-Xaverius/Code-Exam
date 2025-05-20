import React from 'react';
import { 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Star,
  Calendar,
  BarChart
} from 'lucide-react';

const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-start gap-4`}>
      <div className={`flex-shrink-0 rounded-full w-10 h-10 ${color} flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
};

const FeedbackStats = ({ stats }) => {
  if (!stats) return null;
  
  // Get total count
  const totalFeedbacks = stats.categoryStats?.reduce((sum, item) => sum + parseInt(item.count || 0), 0) || 0;
  
  // Get unread feedback count
  const unreadCount = stats.statusStats?.find(s => s.status === 'unread')?.count || 0;
  
  // Get addressed feedback count
  const addressedCount = stats.statusStats?.find(s => s.status === 'addressed')?.count || 0;
  
  return (
    <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Feedbacks"
        value={totalFeedbacks}
        icon={<MessageSquare size={20} className="text-blue-600" />}
        color="bg-blue-100"
      />
      
      <StatCard
        title="Unread Feedbacks"
        value={unreadCount}
        icon={<Clock size={20} className="text-yellow-600" />}
        color="bg-yellow-100"
      />
      
      <StatCard
        title="Addressed Feedbacks"
        value={addressedCount}
        icon={<CheckCircle size={20} className="text-green-600" />}
        color="bg-green-100"
      />
      
      <StatCard
        title="Average Rating"
        value={stats.avgRating || '0.0'}
        icon={<Star size={20} className="text-purple-600" />}
        color="bg-purple-100"
      />
      
      {/* Categories breakdown - optional, expand when needed */}
      {stats.categoryStats && stats.categoryStats.length > 0 && (
        <div className="col-span-1 sm:col-span-2 lg:col-span-4 mt-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Feedback by Category</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.categoryStats.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-gray-700">
                    {item.category}: <span className="font-medium">{item.count}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackStats;