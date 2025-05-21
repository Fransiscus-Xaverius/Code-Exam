import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { UserCircle, Mail, Key, Briefcase, Calendar, Save } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { Card } from '../components/Card';
import { Alert } from '../components/Alert';
import { InputField } from '../components/InputField';
import { Button } from '../components/Button';
import API from '../components/helpers/API';
import { loginSuccess } from '../redux/slices/authSlice';

// Import profile components
import ProfileHeader from '../components/profile/ProfileHeader';
import UserStats from '../components/profile/UserStats';
import RecentActivity from '../components/profile/RecentActivity';
import Achievements from '../components/profile/Achievements';

const ProfilePage = () => {
  const { user, token } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    problemsSolved: 0,
    totalPoints: 0,
    submissionsCount: 0,
    competitionsCount: 0,
    acceptanceRate: 0,
    averageScore: 0
  });
  
  // Form state
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  // Form validation
  const [validation, setValidation] = useState({
    username: true,
    email: true,
    passwordMatch: true
  });

  // Toggle sidebar for mobile views
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // Fetch user profile data and stats
  useEffect(() => {
    const fetchProfileAndStats = async () => {
      try {
        setLoading(true);
        
        // Fetch profile data
        const profileResponse = await API.get('/api/profile', {
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        });
        
        if (profileResponse.data.success) {
          const userData = profileResponse.data.data;
          setProfileData({
            username: userData.username || '',
            email: userData.email || '',
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
            current_password: '',
            new_password: '',
            confirm_password: ''
          });
        } else {
          setError(profileResponse.data.message || 'Failed to load profile data');
        }

        // Fetch user stats
        const statsResponse = await API.get('/api/submissions/stats', {
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        });
        
        if (statsResponse.data.success) {
          const statData = statsResponse.data.stats;
          
          // Calculate acceptance rate
          const acceptedCount = statData.statusCounts.find(s => s.status === 'accepted')?.count || 0;
          const totalSubmissions = statData.statusCounts.reduce((sum, status) => sum + parseInt(status.count), 0) || 1;
          const acceptanceRate = (acceptedCount / totalSubmissions) * 100;
          
          // Calculate total points
          const totalPoints = statData.problemCounts.reduce((sum, problem) => {
            if (problem.problem && problem.problem.title) {
              return sum + (problem.count * (problem.points || 0));
            }
            return sum;
          }, 0);
          
          // Calculate average score per solved problem
          const averageScore = totalPoints / (statData.problemCounts.length || 1);
          
          setStats({
            problemsSolved: statData.problemCounts.length || 0,
            totalPoints: totalPoints,
            submissionsCount: totalSubmissions,
            competitionsCount: 2, // Placeholder value - would come from competitions API
            acceptanceRate: acceptanceRate.toFixed(1),
            averageScore: averageScore.toFixed(1)
          });
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching profile or stats:', err);
        setError('Failed to load profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchProfileAndStats();
    } else {
      navigate('/login');
    }
  }, [token, navigate]);
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Reset validation errors
    if (name === 'username' || name === 'email') {
      setValidation(prev => ({
        ...prev,
        [name]: true
      }));
    }
    
    // Check password match when typing in confirm_password
    if (name === 'new_password' || name === 'confirm_password') {
      const newPassword = name === 'new_password' ? value : profileData.new_password;
      const confirmPassword = name === 'confirm_password' ? value : profileData.confirm_password;
      
      if (newPassword || confirmPassword) {
        setValidation(prev => ({
          ...prev,
          passwordMatch: newPassword === confirmPassword
        }));
      }
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    const newValidation = {
      username: !!profileData.username.trim(),
      email: !!profileData.email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email),
      passwordMatch: !profileData.new_password || profileData.new_password === profileData.confirm_password
    };
    
    setValidation(newValidation);
    
    if (!Object.values(newValidation).every(Boolean)) {
      setError('Please fix the validation errors before submitting.');
      return;
    }
    
    // Clear previous messages
    setError(null);
    setSuccess(false);
    setSaving(true);
    
    try {
      // Prepare data for update
      const updateData = {
        username: profileData.username,
        email: profileData.email,
        first_name: profileData.first_name,
        last_name: profileData.last_name
      };
      
      // Only include password fields if user is changing password
      if (profileData.new_password) {
        updateData.current_password = profileData.current_password;
        updateData.new_password = profileData.new_password;
      }
      
      const response = await API.put('/api/profile', updateData, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      
      if (response.data.success) {
        setSuccess(true);
        
        // Update redux store with new user data
        dispatch(loginSuccess({
          user: response.data.data,
          token
        }));
        
        // Reset password fields
        setProfileData(prev => ({
          ...prev,
          current_password: '',
          new_password: '',
          confirm_password: ''
        }));
        
        // Auto-dismiss success message after 3 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } else {
        setError(response.data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'An error occurred while updating your profile');
    } finally {
      setSaving(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="ml-0 md:ml-64 flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile data...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar - hidden on mobile, visible on desktop */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      {/* Mobile Sidebar - overlay when active */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={toggleSidebar}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button 
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={toggleSidebar}
              >
                <span className="sr-only">Close sidebar</span>
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <Sidebar />
          </div>
        </div>
      )}
      
      <div className="flex-1 ml-0 md:ml-64 flex flex-col">
        {/* Profile Header */}
        <ProfileHeader user={user} toggleSidebar={toggleSidebar} />
        
        <div className="flex-1 p-4 md:p-6">
          {/* Notification Messages */}
          {error && (
            <Alert 
              type="error" 
              message={error} 
              className="mb-4"
            />
          )}
          
          {success && (
            <Alert 
              type="success" 
              message="Profile updated successfully" 
              className="mb-4"
            />
          )}
          
          <div className="max-w-7xl mx-auto">
            {/* Main content - grid layout differently for mobile and desktop */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Profile Info - takes full width on mobile, 1/3 on desktop */}
              <div className="md:col-span-1 space-y-6">
                {/* Profile Summary Card */}
                <Card className="p-6">
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                      <UserCircle size={64} />
                    </div>
                    
                    <h2 className="text-xl font-semibold mb-1">
                      {profileData.first_name && profileData.last_name 
                        ? `${profileData.first_name} ${profileData.last_name}`
                        : profileData.username}
                    </h2>
                    
                    <p className="text-gray-500 mb-4">@{profileData.username}</p>
                    
                    <div className="w-full mt-4 space-y-3">
                      <div className="flex items-center text-gray-600">
                        <Mail className="w-5 h-5 mr-3 text-gray-400" />
                        <span className="text-sm break-all">{profileData.email}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <Briefcase className="w-5 h-5 mr-3 text-gray-400" />
                        <span className="capitalize text-sm">{user?.role || 'User'}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-5 h-5 mr-3 text-gray-400" />
                        <span className="text-sm">Joined {formatDate(user?.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </Card>
                
                {/* User Stats Card */}
                <UserStats userId={user?.id} token={token} />
                
                {/* Achievements Card - only visible on mobile */}
                <div className="md:hidden">
                  <Achievements stats={stats} />
                </div>
              </div>
              
              {/* Main Content Area - takes full width on mobile, 2/3 on desktop */}
              <div className="md:col-span-2 space-y-6">
                {/* Edit Profile Form */}
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-6">Edit Profile</h2>
                  
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                          label="First Name"
                          name="first_name"
                          value={profileData.first_name}
                          onChange={handleChange}
                          placeholder="Enter your first name"
                        />
                        
                        <InputField
                          label="Last Name"
                          name="last_name"
                          value={profileData.last_name}
                          onChange={handleChange}
                          placeholder="Enter your last name"
                        />
                      </div>
                      
                      <InputField
                        label="Username"
                        name="username"
                        value={profileData.username}
                        onChange={handleChange}
                        placeholder="Enter your username"
                        required
                        error={!validation.username && "Username is required"}
                      />
                      
                      <InputField
                        label="Email Address"
                        name="email"
                        type="email"
                        value={profileData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                        error={!validation.email && "Please enter a valid email address"}
                      />
                      
                      <div className="border-t pt-4 mt-6">
                        <h3 className="text-lg font-medium mb-4">Change Password</h3>
                        <p className="text-sm text-gray-500 mb-4">Leave the fields blank if you don't want to change your password</p>
                        
                        <div className="space-y-4">
                          <InputField
                            label="Current Password"
                            name="current_password"
                            type="password"
                            value={profileData.current_password}
                            onChange={handleChange}
                            placeholder="Enter your current password"
                          />
                          
                          <InputField
                            label="New Password"
                            name="new_password"
                            type="password"
                            value={profileData.new_password}
                            onChange={handleChange}
                            placeholder="Enter new password"
                          />
                          
                          <InputField
                            label="Confirm New Password"
                            name="confirm_password"
                            type="password"
                            value={profileData.confirm_password}
                            onChange={handleChange}
                            placeholder="Confirm new password"
                            error={!validation.passwordMatch && "Passwords do not match"}
                          />
                        </div>
                      </div>
                      
                      <div className="mt-6 flex justify-end">
                        <Button
                          type="submit"
                          disabled={saving}
                          className="flex items-center"
                        >
                          {saving ? (
                            <>
                              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </form>
                </Card>
                
                {/* Recent Activity Card */}
                <RecentActivity userId={user?.id} token={token} />
              </div>
            </div>
            
            {/* Achievements - only visible on desktop, full width */}
            <div className="hidden md:block mt-6">
              <Achievements stats={stats} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;