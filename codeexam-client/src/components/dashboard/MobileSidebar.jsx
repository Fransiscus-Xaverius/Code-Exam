import React from 'react';
import { UserCircle, Code, Trophy, Users, Settings, Database, FileText, LogOut, X } from 'lucide-react';

const MobileSidebar = ({
    sidebarOpen,
    toggleSidebar,
    userRole,
    user,
    handleToggleRole,
    handleLogout,
    navigate
}) => {
    return (
        <div
            className={`fixed inset-0 bg-gray-800 bg-opacity-75 z-30 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={toggleSidebar}
        >
            <div
                className={`fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center space-x-2">
                        <Code className="text-blue-600" size={24} />
                        <span className="font-bold text-xl">CodeExam</span>
                    </div>
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
                        aria-label="Close menu"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-4">
                    <div className="flex items-center p-3 mb-6 bg-blue-50 rounded-lg">
                        <UserCircle className="text-blue-600 mr-3" size={24} />
                        <div>
                            <p className="font-medium">{user?.username || 'User'}</p>
                            <p className="text-sm text-gray-500">
                                {userRole === 'admin' ? 'Administrator' :
                                    userRole === 'judge' ? 'Judge' : 'Competitor'}
                            </p>
                        </div>
                    </div>

                    <nav className="space-y-2">
                        <a
                            onClick={() => {
                                navigate('/dashboard');
                                toggleSidebar();
                            }}
                            className="flex items-center p-3 text-blue-600 bg-blue-50 rounded-lg font-medium cursor-pointer"
                        >
                            <Database className="mr-3" size={20} />
                            <span>Problems</span>
                        </a>
                        <a
                            onClick={() => {
                                navigate('/competitions');
                                toggleSidebar();
                            }}
                            className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                        >
                            <Trophy className="mr-3" size={20} />
                            <span>Competitions</span>
                        </a>
                        {(userRole === 'admin' || userRole === 'judge') && (
                            <a
                                onClick={() => {
                                    navigate('/submissions');
                                    toggleSidebar();
                                }}
                                className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                            >
                                <FileText className="mr-3" size={20} />
                                <span>Submissions</span>
                            </a>
                        )}
                        {userRole === 'admin' && (
                            <a
                                onClick={() => {
                                    navigate('/users');
                                    toggleSidebar();
                                }}
                                className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                            >
                                <Users className="mr-3" size={20} />
                                <span>Users</span>
                            </a>
                        )}
                        <a
                            onClick={() => {
                                navigate('/settings');
                                toggleSidebar();
                            }}
                            className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                        >
                            <Settings className="mr-3" size={20} />
                            <span>Settings</span>
                        </a>

                        <button
                            onClick={handleToggleRole}
                            className="flex w-full items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            <UserCircle className="mr-3" size={20} />
                            <span>Switch Role</span>
                        </button>

                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center p-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                        >
                            <LogOut className="mr-3" size={20} />
                            <span>Logout</span>
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default MobileSidebar;