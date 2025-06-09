import { useState, useEffect, useCallback, useMemo } from 'react';
import UserService from '../services/userService';

// Hook for managing users list with pagination, filtering, and sorting
export const useUsers = (initialParams = {}) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [params, setParams] = useState(initialParams);

  const fetchUsers = useCallback(async (fetchParams = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await UserService.getUsers({ ...params, ...fetchParams });
      setUsers(response.data || []);
      setPagination(response.pagination || pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [params, pagination]);

  useEffect(() => {
    fetchUsers();
  }, [params]);

  const updateParams = useCallback((newParams) => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  const refetch = useCallback(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    pagination,
    params,
    updateParams,
    refetch,
    setUsers
  };
};

// Hook for managing a single user
export const useUser = (userId) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUser = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await UserService.getUser(userId);
      setUser(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const refetch = useCallback(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    user,
    loading,
    error,
    refetch,
    setUser
  };
};

// Hook for user operations (CRUD)
export const useUserOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createUser = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const validation = UserService.validateUserData(userData);
      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors).join(', '));
      }
      
      const response = await UserService.createUser(userData);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (userId, userData) => {
    setLoading(true);
    setError(null);
    
    let withPassword = false;

    if(userData.password) {
      withPassword = true;
    }

    try {
      const validation = UserService.validateUserData(userData, true, withPassword);
      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors).join(', '));
      }
      
      const response = await UserService.updateUser(userId, userData);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteUser = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await UserService.deleteUser(userId);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleUserStatus = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await UserService.toggleUserStatus(userId);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    loading,
    error,
    setError
  };
};

// Hook for bulk operations
export const useBulkUserOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({ successful: 0, failed: 0, total: 0 });

  const bulkUpdateUsers = useCallback(async (userIds, updateData) => {
    setLoading(true);
    setError(null);
    setProgress({ successful: 0, failed: 0, total: userIds.length });
    
    try {
      const response = await UserService.bulkUpdateUsers(userIds, updateData);
      setProgress({
        successful: response.successful,
        failed: response.failed,
        total: userIds.length
      });
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkDeleteUsers = useCallback(async (userIds) => {
    setLoading(true);
    setError(null);
    setProgress({ successful: 0, failed: 0, total: userIds.length });
    
    try {
      const response = await UserService.bulkDeleteUsers(userIds);
      setProgress({
        successful: response.successful,
        failed: response.failed,
        total: userIds.length
      });
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    bulkUpdateUsers,
    bulkDeleteUsers,
    loading,
    error,
    progress,
    setError
  };
};

// Hook for user search
export const useUserSearch = (initialQuery = '', initialFilters = {}) => {
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState(initialFilters);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(async (searchQuery = query, searchFilters = filters) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await UserService.searchUsers(searchQuery, searchFilters);
      setResults(response.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [query, filters]);

  const updateQuery = useCallback((newQuery) => {
    setQuery(newQuery);
  }, []);

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setFilters({});
    setResults([]);
    setError(null);
  }, []);

  // Auto-search when query or filters change (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        search();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, filters, search]);

  return {
    query,
    filters,
    results,
    loading,
    error,
    updateQuery,
    updateFilters,
    search,
    clearSearch
  };
};

// Hook for user statistics
export const useUserStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await UserService.getUserStats();
      setStats(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refetch = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch
  };
};

// Hook for filtering and sorting users locally
export const useUserFilters = (users) => {
  const [sortBy, setSortBy] = useState('username');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filters, setFilters] = useState({});

  const filteredUsers = useMemo(() => {
    return UserService.filterUsers(users, filters);
  }, [users, filters]);

  const sortedAndFilteredUsers = useMemo(() => {
    return UserService.sortUsers(filteredUsers, sortBy, sortOrder);
  }, [filteredUsers, sortBy, sortOrder]);

  const updateSort = useCallback((newSortBy, newSortOrder = null) => {
    if (newSortBy === sortBy && !newSortOrder) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder(newSortOrder || 'asc');
    }
  }, [sortBy]);

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  return {
    sortBy,
    sortOrder,
    filters,
    filteredUsers: sortedAndFilteredUsers,
    updateSort,
    updateFilters,
    clearFilters,
    totalFiltered: sortedAndFilteredUsers.length
  };
};

// Hook for user export functionality
export const useUserExport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const exportUsers = useCallback(async (filters = {}, format = 'csv') => {
    setLoading(true);
    setError(null);
    
    try {
      const exportData = await UserService.exportUsers(filters, format);
      
      // Create and download file
      const blob = new Blob([exportData], {
        type: format === 'csv' ? 'text/csv' : 'application/json'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `users_export_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return exportData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    exportUsers,
    loading,
    error
  };
};

// Hook for user form validation
export const useUserValidation = () => {
  const [validationErrors, setValidationErrors] = useState({});

  const validateUser = useCallback((userData) => {
    const validation = UserService.validateUserData(userData);
    setValidationErrors(validation.errors);
    return validation.isValid;
  }, []);

  const clearValidationErrors = useCallback(() => {
    setValidationErrors({});
  }, []);

  const getFieldError = useCallback((fieldName) => {
    return validationErrors[fieldName];
  }, [validationErrors]);

  const hasErrors = useMemo(() => {
    return Object.keys(validationErrors).length > 0;
  }, [validationErrors]);

  return {
    validationErrors,
    validateUser,
    clearValidationErrors,
    getFieldError,
    hasErrors
  };
};

// Hook for managing user selections (useful for bulk operations)
export const useUserSelection = (users = []) => {
  const [selectedUsers, setSelectedUsers] = useState(new Set());

  const selectUser = useCallback((userId) => {
    setSelectedUsers(prev => new Set([...prev, userId]));
  }, []);

  const deselectUser = useCallback((userId) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });
  }, []);

  const toggleUser = useCallback((userId) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedUsers(new Set(users.map(user => user.id)));
  }, [users]);

  const deselectAll = useCallback(() => {
    setSelectedUsers(new Set());
  }, []);

  const isSelected = useCallback((userId) => {
    return selectedUsers.has(userId);
  }, [selectedUsers]);

  const selectedCount = useMemo(() => {
    return selectedUsers.size;
  }, [selectedUsers]);

  const allSelected = useMemo(() => {
    return users.length > 0 && selectedUsers.size === users.length;
  }, [users.length, selectedUsers.size]);

  const someSelected = useMemo(() => {
    return selectedUsers.size > 0 && selectedUsers.size < users.length;
  }, [users.length, selectedUsers.size]);

  const selectedUserIds = useMemo(() => {
    return Array.from(selectedUsers);
  }, [selectedUsers]);

  return {
    selectedUsers: selectedUserIds,
    selectUser,
    deselectUser,
    toggleUser,
    selectAll,
    deselectAll,
    isSelected,
    selectedCount,
    allSelected,
    someSelected,
    setSelectedUsers
  };
};