import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Users, UserPlus, Search, Edit3, 
  MoreVertical, Eye, Shield, Award, Trophy, 
  ChevronDown, X, Check, AlertTriangle, Loader2,
  Crown, UserCog, User, FileText, Mail, Ban,
  UserX, UserCheck, AlertCircle
} from 'lucide-react';

import Sidebar from '../components/Sidebar';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { SearchBar } from '../components/SearchBar';
import { Pagination } from '../components/Pagination';
import { Alert } from '../components/Alert';
import Modal, { ConfirmationModal } from '../components/Modal';
import { useUsers, useUserOperations,  useUserStats } from '../hooks/userServiceHook';
import { useUserStatusOperations, useWarningOperations } from '../hooks/userWarningHooks';

const UserManagementPage = () => {
  const navigate = useNavigate();
  const { userRole, token, user: currentUser } = useSelector(state => state.auth);
  
  // Redirect if not admin
  useEffect(() => {
    if (userRole !== 'admin') {
      navigate('/dashboard');
    }
  }, [userRole, navigate]);

  // Using custom hooks
  const {
    users,
    loading,
    error: usersError,
    pagination,
    updateParams,
    refetch: refetchUsers
  } = useUsers({ page: 1, limit: 10 });

  const {
    createUser,
    updateUser,
    loading: userOperationLoading,
    error: userOperationError,
    setError: setUserOperationError
  } = useUserOperations();

  const {
    updateUserStatus,
    activateUser,
    deactivateUser,
    banUser,
    loading: statusLoading,
    error: statusError,
    setError: setStatusError
  } = useUserStatusOperations();

  const {
    warnUser,
    loading: warningLoading,
    error: warningError,
    setError: setWarningError
  } = useWarningOperations();

  const {
    stats,
    loading: statsLoading,
    refetch: refetchStats
  } = useUserStats();

  // Local state for modals and forms
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showWarnModal, setShowWarnModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [success, setSuccess] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'competitor',
    discuss: false  // Add this line
  });

  const [warningData, setWarningData] = useState({
    reason: '',
    sendEmail: true
  });
  const [statusData, setStatusData] = useState({
    status: '',
    reason: ''
  });

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Update search and filters
  useEffect(() => {
    const params = {
      page: 1,
      ...({ search: searchTerm }),
      ...({ role: roleFilter }),
      ...({ status: statusFilter })
    };
    updateParams(params);
  }, [searchTerm, roleFilter, statusFilter, updateParams]);

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      role: 'competitor',
      discuss: false  // Add this line
    });
  };

  // User CRUD operations
  const handleCreateUser = async () => {
    try {
      await createUser(formData);
      setSuccess('User created successfully!');
      setShowCreateModal(false);
      resetForm();
      refetchUsers();
      refetchStats();
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const handleEditUser = async () => {
    try {
      await updateUser(selectedUser.id, formData);
      setSuccess('User updated successfully!');
      setShowEditModal(false);
      resetForm();
      setSelectedUser(null);
      refetchUsers();
    } catch (err) {
      console.log(err)
      // Error is handled by the hook
    }
  };

  // Warning operations
  const handleWarnUser = async () => {
    try {
      const result = await warnUser(selectedUser.id, warningData.reason, warningData.sendEmail);
      setSuccess(`Warning issued successfully. User has ${result.warningCount} warning(s).`);
      setShowWarnModal(false);
      setWarningData({ reason: '', sendEmail: true });
      setSelectedUser(null);
      refetchUsers();
    } catch (err) {
      // Error is handled by the hook
    }
  };

  // Status operations
  const handleStatusUpdate = async () => {
    try {
      await updateUserStatus(selectedUser.id, statusData.status, statusData.reason);
      setSuccess(`User status updated to ${statusData.status}`);
      setShowStatusModal(false);
      setStatusData({ status: '', reason: '' });
      setSelectedUser(null);
      refetchUsers();
      refetchStats();
    } catch (err) {
      // Error is handled by the hook
    }
  };

  // Modal handlers
  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (user) => {
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      role: user.role,
      discuss: user.discuss || false  // Add this line
    });
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const openWarnModal = (user) => {
    setSelectedUser(user);
    setWarningData({ reason: '', sendEmail: true });
    setShowWarnModal(true);
  };

  const openStatusModal = (user, status) => {
    setSelectedUser(user);
    setStatusData({ status, reason: '' });
    setShowStatusModal(true);
  };

  // Helper functions
  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Crown size={16} className="text-purple-600" />;
      case 'judge': return <Shield size={16} className="text-blue-600" />;
      default: return <User size={16} className="text-gray-600" />;
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'judge': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'banned': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Clear success/error messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Get aggregate error
  const currentError = usersError || userOperationError || statusError || warningError;

  // Clear error handler
  const clearError = () => {
    setUserOperationError(null);
    setStatusError(null);
    setWarningError(null);
  };

  const getDiscussBadgeClass = (discuss) => {
    return discuss 
    ? 'bg-green-100 text-green-800 border-green-200'
    : 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Render status actions dropdown
  const renderStatusActions = (user) => {
    if (user.id === currentUser.id) return null;

    return (
      <div className="relative inline-block text-left">
        <select
          onChange={(e) => {
            if (e.target.value) {
              openStatusModal(user, e.target.value);
              e.target.value = '';
            }
          }}
          className="block w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          defaultValue=""
        >
          <option value="">Change Status</option>
          {user.status !== 'active' && <option value="active">Activate</option>}
          {user.status !== 'inactive' && <option value="inactive">Deactivate</option>}
          {user.status !== 'banned' && <option value="banned">Ban</option>}
        </select>
      </div>
    );
  };

  // Render statistics cards
  const renderStatsCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Users</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
          </div>
          <Users className="h-8 w-8 text-blue-600" />
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Active</p>
            <p className="text-2xl font-bold text-green-900">{users.filter(u => u.status === 'active').length}</p>
          </div>
          <UserCheck className="h-8 w-8 text-green-600" />
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Inactive</p>
            <p className="text-2xl font-bold text-yellow-900">{users.filter(u => u.status === 'inactive').length}</p>
          </div>
          <UserX className="h-8 w-8 text-yellow-600" />
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Banned</p>
            <p className="text-2xl font-bold text-red-900">{users.filter(u => u.status === 'banned').length}</p>
          </div>
          <Ban className="h-8 w-8 text-red-600" />
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Administrators</p>
            <p className="text-2xl font-bold text-purple-900">{stats?.roles?.admin || 0}</p>
          </div>
          <Crown className="h-8 w-8 text-purple-600" />
        </div>
      </Card>
    </div>
  );

  // Render filters section
  const renderFilters = () => (
    <Card className="p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search users by name, email, or username..."
            className="w-full"
          />
        </div>
        
        <div className="lg:w-48">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="judge">Judge</option>
            <option value="competitor">Competitor</option>
          </select>
        </div>

        <div className="lg:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="banned">Banned</option>
          </select>
        </div>
      </div>
    </Card>
  );

  // Render user table
  const renderUserTable = () => (
    <div className="hidden lg:block overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Statistics
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Joined
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Discussion
                        </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">{user.username}</div>
                    <div className="text-sm text-gray-500 max-w-xs truncate">{user.email}</div>
                    {(user.first_name || user.last_name) && (
                      <div className="text-xs text-gray-400">
                        {user.first_name} {user.last_name}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeClass(user.role)}`}>
                  {getRoleIcon(user.role)}
                  <span className="ml-1">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
                </span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(user.status)}`}>
                  {user.status === 'active' && <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>}
                  {user.status === 'inactive' && <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></span>}
                  {user.status === 'banned' && <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>}
                  {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                </span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center">
                    <span className="w-16 text-xs text-gray-400">Submissions:</span>
                    <span className="ml-1 font-medium">{user.stats?.submissions || 0}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-16 text-xs text-gray-400">Accepted:</span>
                    <span className="ml-1 font-medium text-green-600">{user.stats?.accepted || 0}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-16 text-xs text-gray-400">Contests:</span>
                    <span className="ml-1 font-medium">{user.stats?.competitions || 0}</span>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(user.created_at)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-right">
                <div className="flex items-center justify-end space-x-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedUser(user) || setShowUserDetails(true)}
                    className="p-2 hover:bg-blue-50"
                    title="View Details"
                  >
                    <Eye size={14} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditModal(user)}
                    className="p-2 hover:bg-gray-50"
                    title="Edit User"
                  >
                    <Edit3 size={14} />
                  </Button>
                  {user.id !== currentUser.id && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openWarnModal(user)}
                        className="p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                        title="Warn User"
                      >
                        <AlertTriangle size={14} />
                      </Button>
                      <div className="relative">
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              openStatusModal(user, e.target.value);
                              e.target.value = '';
                            }
                          }}
                          className="block w-20 px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
                          defaultValue=""
                        >
                          <option value="">Status</option>
                          {user.status !== 'active' && <option value="active">Activate</option>}
                          {user.status !== 'inactive' && <option value="inactive">Deactivate</option>}
                          {user.status !== 'banned' && <option value="banned">Ban</option>}
                        </select>
                        
                      </div>
                    </>
                  )}
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getDiscussBadgeClass(user.discuss)}`}>
                  {user.discuss ? (
                    <>
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                      Enabled
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 bg-gray-500 rounded-full mr-1"></span>
                      Disabled
                    </>
                  )}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Render user cards for mobile and tablet
  const renderUserCards = () => (
    <div className="lg:hidden space-y-4">
      {users.map((user) => (
        <Card key={user.id} className="p-4 hover:shadow-md transition-shadow">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">{user.username}</h3>
                <p className="text-sm text-gray-500 truncate max-w-48">{user.email}</p>
                {(user.first_name || user.last_name) && (
                  <p className="text-xs text-gray-400">{user.first_name} {user.last_name}</p>
                )}
              </div>
            </div>
            
            {user.id !== currentUser.id && (
              <div className="flex items-center space-x-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openWarnModal(user)}
                  className="p-2 text-orange-600 hover:bg-orange-50"
                >
                  <AlertTriangle size={14} />
                </Button>
                <div className="relative">
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Role and Status */}
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeClass(user.role)}`}>
              {getRoleIcon(user.role)}
              <span className="ml-1">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(user.status)}`}>
              {user.status === 'active' && <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>}
              {user.status === 'inactive' && <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></span>}
              {user.status === 'banned' && <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>}
              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
            </span>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">{user.stats?.submissions || 0}</div>
              <div className="text-xs text-gray-500">Submissions</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded-lg">
              <div className="text-lg font-semibold text-green-600">{user.stats?.accepted || 0}</div>
              <div className="text-xs text-green-700">Accepted</div>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded-lg">
              <div className="text-lg font-semibold text-blue-600">{user.stats?.competitions || 0}</div>
              <div className="text-xs text-blue-700">Contests</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              Joined {formatDate(user.created_at)}
            </span>
            <div className="flex space-x-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedUser(user) || setShowUserDetails(true)}
                className="px-3 py-1 text-xs"
              >
                <Eye size={12} className="mr-1" />
                View
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => openEditModal(user)}
                className="px-3 py-1 text-xs"
              >
                <Edit3 size={12} className="mr-1" />
                Edit
              </Button>
              {user.id !== currentUser.id && (
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      openStatusModal(user, e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-blue-500"
                  defaultValue=""
                >
                  <option value="">Status</option>
                  {user.status !== 'active' && <option value="active">Activate</option>}
                  {user.status !== 'inactive' && <option value="inactive">Deactivate</option>}
                  {user.status !== 'banned' && <option value="banned">Ban</option>}
                </select>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  // Warning modal
  const renderWarnModal = () => (
    <Modal
      isOpen={showWarnModal}
      onClose={() => {
        setShowWarnModal(false);
        setSelectedUser(null);
        setWarningData({ reason: '', sendEmail: true });
      }}
      title="Warn User"
      size="md"
    >
      {selectedUser && (
        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
              <span className="text-sm font-medium text-orange-800">
                Warning {selectedUser.username}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Warning Reason *
            </label>
            <textarea
              value={warningData.reason}
              onChange={(e) => setWarningData(prev => ({ ...prev, reason: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder="Explain the reason for this warning..."
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="sendEmail"
              checked={warningData.sendEmail}
              onChange={(e) => setWarningData(prev => ({ ...prev, sendEmail: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="sendEmail" className="ml-2 block text-sm text-gray-900">
              Send warning email to user
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowWarnModal(false);
                setSelectedUser(null);
                setWarningData({ reason: '', sendEmail: true });
              }}
              disabled={warningLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleWarnUser}
              disabled={warningLoading || !warningData.reason.trim()}
              className="bg-orange-600 hover:bg-orange-700 text-white flex items-center"
            >
              {warningLoading && <Loader2 size={16} className="mr-2 animate-spin" />}
              Issue Warning
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );

  // Status update modal
  const renderStatusModal = () => (
    <Modal
      isOpen={showStatusModal}
      onClose={() => {
        setShowStatusModal(false);
        setSelectedUser(null);
        setStatusData({ status: '', reason: '' });
      }}
      title={`${statusData.status === 'active' ? 'Activate' : statusData.status === 'inactive' ? 'Deactivate' : 'Ban'} User`}
      size="md"
    >
      {selectedUser && (
        <div className="space-y-4">
          <div className={`border rounded-lg p-4 ${
            statusData.status === 'active' ? 'bg-green-50 border-green-200' :
            statusData.status === 'inactive' ? 'bg-yellow-50 border-yellow-200' :
            'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center">
              {statusData.status === 'active' && <UserCheck className="h-5 w-5 text-green-600 mr-2" />}
              {statusData.status === 'inactive' && <UserX className="h-5 w-5 text-yellow-600 mr-2" />}
              {statusData.status === 'banned' && <Ban className="h-5 w-5 text-red-600 mr-2" />}
              <span className={`text-sm font-medium ${
                statusData.status === 'active' ? 'text-green-800' :
                statusData.status === 'inactive' ? 'text-yellow-800' :
                'text-red-800'
              }`}>
                {statusData.status === 'active' ? 'Activating' : statusData.status === 'inactive' ? 'Deactivating' : 'Banning'} {selectedUser.username}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason {statusData.status !== 'active' && '*'}
            </label>
            <textarea
              value={statusData.reason}
              onChange={(e) => setStatusData(prev => ({ ...prev, reason: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder={`Explain the reason for ${statusData.status === 'active' ? 'activating' : statusData.status === 'inactive' ? 'deactivating' : 'banning'} this user...`}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowStatusModal(false);
                setSelectedUser(null);
                setStatusData({ status: '', reason: '' });
              }}
              disabled={statusLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={statusLoading || (statusData.status !== 'active' && !statusData.reason.trim())}
              className={`flex items-center text-white ${
                statusData.status === 'active' ? 'bg-green-600 hover:bg-green-700' :
                statusData.status === 'inactive' ? 'bg-yellow-600 hover:bg-yellow-700' :
                'bg-red-600 hover:bg-red-700'
              }`}
            >
              {statusLoading && <Loader2 size={16} className="mr-2 animate-spin" />}
              {statusData.status === 'active' ? 'Activate' : statusData.status === 'inactive' ? 'Deactivate' : 'Ban'} User
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );

  // User form modal (create/edit)
  const renderUserFormModal = () => (
    <Modal
      isOpen={showCreateModal || showEditModal}
      onClose={() => {
        setShowCreateModal(false);
        setShowEditModal(false);
        resetForm();
        setSelectedUser(null);
      }}
      title={showCreateModal ? 'Create New User' : 'Edit User'}
      size="md"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username *
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter email"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter first name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter last name"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role *
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="competitor">Competitor</option>
              <option value="judge">Judge</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password {showEditModal && '(leave blank to keep current)'}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder={showEditModal ? "Enter new password" : "Enter password"}
            />
          </div>

          <div className="col-span-1 sm:col-span-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="discuss"
                id="discuss"
                checked={formData.discuss}
                onChange={(e) => setFormData(prev => ({ ...prev, discuss: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="discuss" className="ml-2 block text-sm text-gray-900">
                Enable discussion forum access
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Allow this user to participate in discussion forums
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button
          variant="outline"
          onClick={() => {
            setShowCreateModal(false);
            setShowEditModal(false);
            resetForm();
            setSelectedUser(null);
          }}
          disabled={userOperationLoading}
        >
          Cancel
        </Button>
        <Button
          onClick={showCreateModal ? handleCreateUser : handleEditUser}
          disabled={userOperationLoading}
          className="flex items-center"
        >
          {userOperationLoading && <Loader2 size={16} className="mr-2 animate-spin" />}
          {showCreateModal ? 'Create User' : 'Update User'}
        </Button>
      </div>
    </Modal>
  );

  // Main render
  if (userRole !== 'admin') {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 md:ml-64">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Manage users, roles, and permissions for your CodeExam platform
                  </p>
                </div>
                <div className="mt-4 sm:mt-0">
                  <Button
                    onClick={openCreateModal}
                    className="w-full sm:w-auto flex items-center justify-center"
                  >
                    <UserPlus size={16} className="mr-2" />
                    Add New User
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Success/Error Messages */}
          {success && (
            <Alert type="success" message={success} className="mb-6" />
          )}
          {currentError && (
            <Alert 
              type="error" 
              message={currentError} 
              className="mb-6"
              onClose={clearError}
            />
          )}

          {/* Statistics Cards */}
          {renderStatsCards()}

          {/* Filters */}
          {renderFilters()}

          {/* User List */}
          <Card className="overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-medium text-gray-900">
                  All Users ({pagination.total || 0})
                </h2>
                <div className="mt-2 sm:mt-0 text-sm text-gray-500">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                <p className="mt-2 text-gray-500">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new user account.
                </p>
                <div className="mt-6">
                  <Button onClick={openCreateModal} className="flex items-center">
                    <UserPlus size={16} className="mr-2" />
                    Add New User
                  </Button>
                </div>
              </div>
            ) : (
              renderUserTable()
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={(page) => updateParams({ page })}
                />
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Modals */}
      {renderUserFormModal()}
      {renderWarnModal()}
      {renderStatusModal()}
    </div>
  );
};

export default UserManagementPage;