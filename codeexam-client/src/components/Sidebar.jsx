import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Code, Trophy, UserCircle, Database, Users, Settings,
  LogOut, BookOpen, FileText, Menu, X, MessageSquare,
  Inbox, Activity, User
} from 'lucide-react';
import {
  logout,
  // toggleUserRole
} from '../redux/slices/authSlice';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { userRole, user } = useSelector((state) => state.auth);

  // Define navigation items based on user role
  const getNavigationItems = (role) => {
    let commonItems = [];

    console.log(user)

    if(user.discuss) {
          commonItems = [
            {
              icon: <Database className="h-5 w-5" />,
              label: 'Problems',
              path: '/dashboard',
              active: location.pathname === '/dashboard' || location.pathname === '/'
            },
            {
              icon: <Trophy className="h-5 w-5" />,
              label: 'Competitions',
              path: '/competitions',
              active: location.pathname.startsWith('/competitions')
            },
            {
              icon: <BookOpen className='h-5 w-5' />,
              label: 'Discussions',
              path: '/discussions',
              active: location.pathname === '/discussions'
            },
            {
              icon: <User className='h-5 w-5' />,
              label: 'Profile',
              path: '/profile'
            }
          ]
    } else {
        commonItems = [
          {
            icon: <Database className="h-5 w-5" />,
            label: 'Problems',
            path: '/dashboard',
            active: location.pathname === '/dashboard' || location.pathname === '/'
          },
          {
            icon: <Trophy className="h-5 w-5" />,
            label: 'Competitions',
            path: '/competitions',
            active: location.pathname.startsWith('/competitions')
          },
          {
            icon: <User className='h-5 w-5' />,
            label: 'Profile',
            path: '/profile'
          }
        ] 
    }

    const roleSpecificItems = {
      competitor: [
        // { 
        //   icon: <UserCircle className="h-5 w-5" />, 
        //   label: 'My Profile', 
        //   path: '/profile',
        //   active: location.pathname === '/profile'
        // },
        { 
          icon: <FileText className="h-5 w-5" />, 
          label: 'My Submissions', 
          path: '/my-submissions',
          active: location.pathname === '/my-submissions'
        },
        {
          icon: <MessageSquare className="h-5 w-5" />,
          label: 'Submit Feedback',
          path: '/feedback',
          active: location.pathname === '/feedback'
        },
      ],
      admin: [
        {
          icon: <Users className="h-5 w-5" />,
          label: 'User Management',
          path: '/manage/users',
          active: location.pathname === '/manage/users'
        },
        // { 
        //   icon: <FileText className="h-5 w-5" />, 
        //   label: 'All Submissions', 
        //   path: '/submissions',
        //   active: location.pathname === '/submissions'
        // },
        { 
          icon: <Inbox className="h-5 w-5" />, 
          label: 'Manage Feedback', 
          path: '/manage/feedback',
          active: location.pathname === '/manage/feedback'
        },
        // { 
        //   icon: <Settings className="h-5 w-5" />, 
        //   label: 'Platform Settings', 
        //   path: '/settings',
        //   active: location.pathname === '/settings'
        // },
      ],
      judge: [
        // { 
        //   icon: <FileText className="h-5 w-5" />, 
        //   label: 'Review Submissions', 
        //   path: '/review',
        //   active: location.pathname === '/review'
        // },
        // { 
        //   icon: <Activity className="h-5 w-5" />, 
        //   label: 'Judge Panel', 
        //   path: '/judge-panel',
        //   active: location.pathname === '/judge-panel'
        // },
        { 
          icon: <MessageSquare className="h-5 w-5" />, 
          label: 'Feedback', 
          path: '/feedback',
          active: location.pathname === '/feedback'
        },
      ]
    };

    return [...commonItems, ...(roleSpecificItems[role] || [])];
  };

  const navigationItems = getNavigationItems(userRole);

  // Handler for navigation
  const handleNavigation = (path) => {
    navigate(path);
  };

  // Handle role toggle (for demo purposes)
  const handleToggleRole = () => {
    // dispatch(toggleUserRole());
  };

  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="bg-gray-800 text-white w-64 h-screen fixed left-0 top-0 z-20 overflow-y-auto">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center">
          <Code className="h-8 w-8 text-blue-400 mr-2" />
          <h1 className="text-xl font-bold">CodeExam</h1>
        </div>
        <div className="text-sm text-gray-400 mt-1">
          <span className="font-medium text-gray-200 capitalize">{userRole}</span>
          {user && (
            <div className="text-xs mt-1">
              {user.username}
            </div>
          )}
        </div>
      </div>

      <nav className="mt-4 px-2">
        <ul className="space-y-1">
          {navigationItems.map((item, index) => (
            <li key={index}>
              <button
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors duration-200 ${item.active
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
              >
                <span className={`${item.active ? 'text-white' : 'text-gray-400'} transition-colors`}>
                  {item.icon}
                </span>
                <span className="ml-3 font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="absolute bottom-4 left-0 right-0 px-4 space-y-2">
        {/* <button
          onClick={handleToggleRole}
          className="w-full bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600 text-sm transition-colors duration-200 flex items-center justify-center"
        >
          <UserCircle className="h-4 w-4 mr-2" />
          Switch Role
        </button> */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 text-sm flex items-center justify-center transition-colors duration-200"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;