import API from '../components/helpers/API';

class UserService {
  // Get users with pagination and filtering
  static async getUsers(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Add pagination
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      // Add search
      if (params.search) queryParams.append('search', params.search);
      
      // Add role filter
      if (params.role) queryParams.append('role', params.role);
      
      const response = await API.get(`/api/manage/users?${queryParams}`);
      
      return {
        data: response.data.data,
        pagination: {
          page: params.page || 1,
          limit: params.limit || 10,
          total: response.data.count,
          totalPages: Math.ceil(response.data.count / (params.limit || 10))
        }
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  }

  // Get single user with detailed stats
  static async getUser(userId) {
    try {
      const response = await API.get(`/api/manage/users/${userId}`);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user');
    }
  }

  // Create new user
  static async createUser(userData) {
    try {
      const response = await API.post('/api/manage/users', userData);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create user');
    }
  }

  // Update user
  static async updateUser(userId, userData) {
    try {
      const response = await API.put(`/api/manage/users/${userId}`, userData);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update user');
    }
  }

  // Delete user
  static async deleteUser(userId) {
    try {
      const response = await API.delete(`/api/manage/users/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete user');
    }
  }

  // Get user statistics
  static async getUserStats() {
    try {
      const response = await API.get('/api/manage/users/stats');
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user statistics');
    }
  }

  // Update user status (active/inactive/banned)
  static async updateUserStatus(userId, status, reason = '') {
    try {
      const response = await API.put(`/api/manage/users/${userId}/status`, {
        status,
        reason
      });
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update user status');
    }
  }

  // Warn user
  static async warnUser(userId, reason, sendEmail = true) {
    try {
      const response = await API.post(`/api/manage/users/${userId}/warn`, {
        reason,
        sendEmail
      });
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to warn user');
    }
  }

  // Get user warnings
  static async getUserWarnings(userId, page = 1, limit = 10) {
    try {
      const response = await API.get(`/api/manage/users/${userId}/warnings?page=${page}&limit=${limit}`);
      return {
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user warnings');
    }
  }

  // Get all warnings (admin overview)
  static async getAllWarnings(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await API.get(`/api/manage/warnings?${queryParams}`);
      return {
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch warnings');
    }
  }

  // Delete warning
  static async deleteWarning(warningId) {
    try {
      const response = await API.delete(`/api/manage/warnings/${warningId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete warning');
    }
  }

  // Search users
  static async searchUsers(query, filters = {}) {
    try {
      const params = new URLSearchParams();
      params.append('search', query);
      
      // Add additional filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await API.get(`/api/manage/users?${params}`);
      return {
        data: response.data.data,
        total: response.data.count
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to search users');
    }
  }

  // Bulk operations
  static async bulkUpdateUsers(userIds, updateData) {
    try {
      const response = await API.put('/api/manage/users/bulk', {
        userIds,
        updateData
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to bulk update users');
    }
  }

  static async bulkDeleteUsers(userIds) {
    try {
      const response = await API.delete('/api/manage/users/bulk', {
        data: { userIds }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to bulk delete users');
    }
  }

  // Export users
  static async exportUsers(filters = {}, format = 'csv') {
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await API.get(`/api/manage/users/export?${params}`, {
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to export users');
    }
  }

  // Client-side validation based on User model
  static validateUserData(userData, isUpdate = false) {
    const errors = {};

    // Username validation
    if (!isUpdate || userData.username !== undefined) {
      if (!userData.username || !userData.username.trim()) {
        errors.username = 'Please provide a username';
      } else if (userData.username.length > 50) {
        errors.username = 'Username cannot be more than 50 characters';
      }
    }

    // Email validation
    if (!isUpdate || userData.email !== undefined) {
      if (!userData.email || !userData.email.trim()) {
        errors.email = 'Please provide an email';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
        errors.email = 'Please provide a valid email';
      } else if (userData.email.length > 100) {
        errors.email = 'Email cannot be more than 100 characters';
      }
    }

    // Password validation (only required for new users)
    if (!isUpdate && (!userData.password || !userData.password.trim())) {
      errors.password = 'Please provide a password';
    } else if (userData.password && userData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    // Role validation
    if (userData.role && !['competitor', 'admin', 'judge'].includes(userData.role)) {
      errors.role = 'Role must be competitor, admin, or judge';
    }

    // First name validation
    if (userData.first_name && userData.first_name.length > 50) {
      errors.first_name = 'First name cannot be more than 50 characters';
    }

    // Last name validation
    if (userData.last_name && userData.last_name.length > 50) {
      errors.last_name = 'Last name cannot be more than 50 characters';
    }

    // Status validation
    if (userData.status && !['active', 'inactive', 'banned'].includes(userData.status)) {
      errors.status = 'Status must be active, inactive, or banned';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Client-side filtering
  static filterUsers(users, filters) {
    return users.filter(user => {
      // Role filter
      if (filters.role && user.role !== filters.role) {
        return false;
      }

      // Status filter
      if (filters.status && user.status !== filters.status) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const searchableFields = [
          user.username,
          user.email,
          user.first_name,
          user.last_name
        ].filter(Boolean).map(field => field.toLowerCase());

        const matches = searchableFields.some(field => 
          field.includes(searchLower)
        );

        if (!matches) return false;
      }

      return true;
    });
  }

  // Client-side sorting
  static sortUsers(users, sortBy, sortOrder = 'asc') {
    return [...users].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'username':
          aValue = a.username || '';
          bValue = b.username || '';
          break;
        case 'email':
          aValue = a.email || '';
          bValue = b.email || '';
          break;
        case 'role':
          aValue = a.role || '';
          bValue = b.role || '';
          break;
        case 'status':
          aValue = a.status || '';
          bValue = b.status || '';
          break;
        case 'created_at':
          aValue = new Date(a.created_at || 0);
          bValue = new Date(b.created_at || 0);
          break;
        case 'name':
          aValue = `${a.first_name || ''} ${a.last_name || ''}`.trim();
          bValue = `${b.first_name || ''} ${b.last_name || ''}`.trim();
          break;
        default:
          aValue = a[sortBy] || '';
          bValue = b[sortBy] || '';
      }

      if (aValue < bValue) {
        return sortOrder === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  // Helper method to format user for display
  static formatUserForDisplay(user) {
    return {
      ...user,
      fullName: `${user.first_name || ''} ${user.last_name || ''}`.trim() || null,
      displayName: user.first_name || user.last_name 
        ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
        : user.username,
      initials: this.getUserInitials(user),
      isActive: user.status === 'active'
    };
  }

  // Helper method to get user initials
  static getUserInitials(user) {
    if (user.first_name && user.last_name) {
      return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
    } else if (user.first_name) {
      return user.first_name.charAt(0).toUpperCase();
    } else if (user.last_name) {
      return user.last_name.charAt(0).toUpperCase();
    } else {
      return user.username.charAt(0).toUpperCase();
    }
  }

  // Helper method to get role badge class
  static getRoleBadgeClass(role) {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'judge':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'competitor':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  // Helper method to get status badge class
  static getStatusBadgeClass(status) {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'banned':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }
}

export default UserService;