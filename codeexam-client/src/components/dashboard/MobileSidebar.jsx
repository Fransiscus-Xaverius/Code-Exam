// Enhanced Mobile sidebar component with complete menu structure matching desktop sidebar
const MobileSidebar = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  // Define navigation items based on user role (same logic as desktop sidebar)
  const getNavigationItems = (role) => {
    const commonItems = [
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
        path: '/profile',
        active: location.pathname === '/profile'
      }
    ];

    const roleSpecificItems = {
      competitor: [
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
        { 
          icon: <Inbox className="h-5 w-5" />, 
          label: 'Manage Feedback', 
          path: '/manage/feedback',
          active: location.pathname === '/manage/feedback'
        },
      ],
      judge: [
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
    setSidebarOpen(false); // Close sidebar after navigation
  };

  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    setSidebarOpen(false);
  };

  return (
    <div
      className={`fixed inset-0 bg-gray-800 bg-opacity-75 z-30 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={toggleSidebar}
    >
      <div
        className={`fixed inset-y-0 left-0 max-w-xs w-full bg-gray-800 text-white shadow-xl transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <Code className="h-8 w-8 text-blue-400" />
            <div>
              <h1 className="text-xl font-bold">CodeExam</h1>
              <div className="text-sm text-gray-400">
                <span className="font-medium text-gray-200 capitalize">{userRole}</span>
                {user && (
                  <div className="text-xs mt-1">
                    {user.username}
                  </div>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto py-4 px-2">
          <nav>
            <ul className="space-y-1">
              {navigationItems.map((item, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center px-3 py-3 rounded-lg text-left transition-colors duration-200 ${
                      item.active
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <span className={`${item.active ? 'text-white' : 'text-gray-400'} transition-colors mr-3 flex-shrink-0`}>
                      {item.icon}
                    </span>
                    <span className="font-medium truncate">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-700 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 text-sm flex items-center justify-center transition-colors duration-200"
          >
            <LogOut className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};