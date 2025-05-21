import React from 'react';
import { UserCircle, ChevronLeft, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfileHeader = ({ user, toggleSidebar }) => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };
  
  return (
    <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* Mobile Menu Button - visible on mobile only */}
            <button
              onClick={toggleSidebar}
              className="mr-4 p-2 rounded-lg hover:bg-gray-100 md:hidden"
              aria-label="Menu"
            >
              <Menu size={20} />
            </button>
            
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="mr-4 p-2 rounded-full hover:bg-gray-100"
              aria-label="Go back"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div>
              <h1 className="text-xl font-bold text-gray-900">Profile</h1>
              <p className="text-sm text-gray-500 hidden sm:block">
                View and update your personal information
              </p>
            </div>
          </div>
          
          {/* User Avatar - visible on desktop only */}
          <div className="hidden sm:flex items-center">
            <div className="mr-4 text-right">
              <p className="font-medium">{user?.username}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <UserCircle size={24} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;