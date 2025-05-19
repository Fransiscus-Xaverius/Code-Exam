import { useState, useEffect, useCallback, useMemo } from 'react';
import UserService from '../services/userService';

// Hook for warning operations
export const useUserWarnings = (userId = null) => {
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchWarnings = useCallback(async (page = 1) => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await UserService.getUserWarnings(userId, page, pagination.limit);
      setWarnings(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, pagination.limit]);

  useEffect(() => {
    if (userId) {
      fetchWarnings();
    }
  }, [fetchWarnings]);

  const refetch = useCallback(() => {
    fetchWarnings(pagination.page);
  }, [fetchWarnings, pagination.page]);

  return {
    warnings,
    loading,
    error,
    pagination,
    fetchWarnings,
    refetch,
    setWarnings
  };
};

// Hook for warning operations (create, delete)
export const useWarningOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const warnUser = useCallback(async (userId, reason, sendEmail = true) => {
    setLoading(true);
    setError(null);
    
    try {
      if (!reason?.trim()) {
        throw new Error('Warning reason is required');
      }
      
      const response = await UserService.warnUser(userId, reason.trim(), sendEmail);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteWarning = useCallback(async (warningId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await UserService.deleteWarning(warningId);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    warnUser,
    deleteWarning,
    loading,
    error,
    setError
  };
};

// Hook for user status operations
export const useUserStatusOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateUserStatus = useCallback(async (userId, status, reason = '') => {
    setLoading(true);
    setError(null);
    
    try {
      if (!['active', 'inactive', 'banned'].includes(status)) {
        throw new Error('Invalid status. Must be active, inactive, or banned');
      }
      
      const response = await UserService.updateUserStatus(userId, status, reason);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const activateUser = useCallback(async (userId, reason = '') => {
    return updateUserStatus(userId, 'active', reason);
  }, [updateUserStatus]);

  const deactivateUser = useCallback(async (userId, reason = '') => {
    return updateUserStatus(userId, 'inactive', reason);
  }, [updateUserStatus]);

  const banUser = useCallback(async (userId, reason = '') => {
    return updateUserStatus(userId, 'banned', reason);
  }, [updateUserStatus]);

  return {
    updateUserStatus,
    activateUser,
    deactivateUser,
    banUser,
    loading,
    error,
    setError
  };
};

// Hook for all warnings (admin overview)
export const useAllWarnings = (initialParams = {}) => {
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [params, setParams] = useState(initialParams);

  const fetchWarnings = useCallback(async (fetchParams = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await UserService.getAllWarnings({ ...params, ...fetchParams });
      setWarnings(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchWarnings();
  }, [params]);

  const updateParams = useCallback((newParams) => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  const refetch = useCallback(() => {
    fetchWarnings();
  }, [fetchWarnings]);

  return {
    warnings,
    loading,
    error,
    pagination,
    params,
    updateParams,
    refetch,
    setWarnings
  };
};

// Enhanced user operations hook with status and warning functions
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
    
    try {
      const validation = UserService.validateUserData(userData, true);
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

  const warnUser = useCallback(async (userId, reason, sendEmail = true) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await UserService.warnUser(userId, reason, sendEmail);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserStatus = useCallback(async (userId, status, reason = '') => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await UserService.updateUserStatus(userId, status, reason);
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
    warnUser,
    updateUserStatus,
    loading,
    error,
    setError
  };
};