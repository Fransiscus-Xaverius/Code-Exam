import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Code, Trophy, UserCircle, Database, Users, Settings, LogOut, BookOpen } from 'lucide-react';
import { logout, toggleUserRole } from '../redux/slices/authSlice';

const Sidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userRole } = useSelector((state) => state.auth);

  // Define navigation items based on user role
  const commonItems = [
    { icon: <Code className="h-5 w-5" />, label: 'Problems', path: '/problems' },
    { icon: <Trophy className="h-5 w-5" />, label: 'Competitions', path: '/competitions' },
    { icon: <BookOpen className='h-5 w-5'/>, label: 'Discussions', path: '/discussions'}
  ];
  
  const roleSpecificItems = {
    competitor: [
      { icon: <UserCircle className="h-5 w-5" />, label: 'My Profile', path: '/profile' },
      { icon: <Database className="h-5 w-5" />, label: 'My Submissions', path: '/my-submissions' },
    ],
    admin: [
      { icon: <Users className="h-5 w-5" />, label: 'User Admin', path: '/participants' },
      { icon: <Settings className="h-5 w-5" />, label: 'Platform Settings', path: '/settings' },
      { icon: <Database className="h-5 w-5" />, label: 'All Submissions', path: '/submissions' },
    ],
    judge: [
      { icon: <Database className="h-5 w-5" />, label: 'Review Submissions', path: '/review' },
      { icon: <Users className="h-5 w-5" />, label: 'Judge Panel', path: '/judge-panel' },
    ]
  };
  
  const items = [...commonItems, ...(roleSpecificItems[userRole] || [])];
  
  // Handler for navigation
  const handleNavigation = (path) => {
    navigate(path);
  };
  
  // Handle role toggle (for demo purposes)
  const handleToggleRole = () => {
    dispatch(toggleUserRole());
  };
  
  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  
  return (
    <div className="bg-gray-800 text-white w-64 h-screen fixed left-0 top-0">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">CodeExam</h1>
        <div className="text-sm text-gray-400 mt-1">
          Logged in as <span className="font-medium text-gray-200 capitalize">{userRole}</span>
        </div>
      </div>
      
      <nav className="mt-4">
        <ul>
          {items.map((item, index) => (
            <li key={index}>
              <button 
                onClick={() => handleNavigation(item.path)} 
                className="w-full flex items-center px-4 py-3 hover:bg-gray-700 text-left"
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="absolute bottom-4 left-0 right-0 px-4 space-y-2">
        <button
          onClick={handleToggleRole}
          className="w-full bg-gray-700 text-white py-2 px-4 rounded hover:bg-gray-600 text-sm"
        >
          Switch Role (Demo)
        </button>
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 text-sm flex items-center justify-center"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;