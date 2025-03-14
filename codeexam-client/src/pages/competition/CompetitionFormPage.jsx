import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Save, ArrowLeft, Calendar, Clock, Info, Globe, Users } from 'lucide-react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Alert } from '../../components/Alert';
import Sidebar from '../../components/Sidebar';
import DateTimePicker from 'react-datetime-picker';
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';

// Input field component for form fields
const InputField = ({ label, name, value, onChange, type = 'text', required = false, placeholder = '', error = false }) => {
  return (
    <div className="flex flex-col">
      <label htmlFor={name} className="text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 focus:ring-blue-500 focus:border-blue-500`}
        required={required}
      />
      {error && <p className="mt-1 text-sm text-red-500">This field is required</p>}
    </div>
  );
};

const CompetitionFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get competition ID from URL if editing
  const isEditMode = !!id;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Get user data from Redux store
  const { token } = useSelector(state => state.auth);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_time: new Date(new Date().setHours(new Date().getHours() + 1)),
    end_time: new Date(new Date().setHours(new Date().getHours() + 3)),
    is_public: true,
    registration_required: true,
    leaderboard_visible: true
  });
  
  // Form validation state
  const [validation, setValidation] = useState({
    name: true,
    description: true,
    start_time: true,
    end_time: true
  });
  
  // Fetch competition data if in edit mode
  useEffect(() => {
    const fetchCompetitionData = async () => {
      if (!isEditMode) return;
      
      try {
        setIsLoading(true);
        const headers = { Authorization: token ? `Bearer ${token}` : '' };
        
        const response = await axios.get(`/api/competitions/${id}`, { headers });
        
        // Populate form with existing data
        const competition = response.data.data;
        setFormData({
          ...competition,
          start_time: new Date(competition.start_time),
          end_time: new Date(competition.end_time),
          is_public: competition.is_public ?? true,
          registration_required: competition.registration_required ?? true,
          leaderboard_visible: competition.leaderboard_visible ?? true
        });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching competition:', err);
        setError('Failed to load competition data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCompetitionData();
  }, [id, isEditMode, token]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear validation error when user types
    if (!validation[name]) {
      setValidation(prev => ({
        ...prev,
        [name]: true
      }));
    }
  };
  
  // Handle date changes
  const handleDateChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error
    if (!validation[name]) {
      setValidation(prev => ({
        ...prev,
        [name]: true
      }));
    }
  };
  
  // Validate form before submission
  const validateForm = () => {
    const newValidation = {
      name: !!formData.name.trim(),
      description: !!formData.description.trim(),
      start_time: !!formData.start_time && formData.start_time instanceof Date,
      end_time: !!formData.end_time && formData.end_time instanceof Date && 
                formData.end_time > formData.start_time
    };
    
    setValidation(newValidation);
    return Object.values(newValidation).every(valid => valid);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset states
    setError(null);
    setSuccess(false);
    
    // Validate form
    if (!validateForm()) {
      setError('Please fill in all required fields correctly. End time must be after start time.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const headers = { 
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '' 
      };
      
      // Format dates for API
      const submitData = {
        ...formData,
        start_time: formData.start_time.toISOString(),
        end_time: formData.end_time.toISOString()
      };
      
      // Make API request based on mode (add or edit)
      if (isEditMode) {
        await axios.put(`/api/competitions/${id}`, submitData, { headers });
      } else {
        await axios.post('/api/competitions', submitData, { headers });
      }
      
      setSuccess(true);
      
      // Redirect after successful submission
      setTimeout(() => {
        navigate('/competitions');
      }, 1500);
      
    } catch (err) {
      console.error('Error saving competition:', err);
      setError(err.response?.data?.message || 'Failed to save competition. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 p-6 ml-64">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/competitions')}
              className="mr-4 p-2 rounded-full hover:bg-gray-200"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              {isEditMode ? 'Edit Competition' : 'Create New Competition'}
            </h1>
          </div>
          
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center"
          >
            <Save size={16} className="mr-1" />
            {isSubmitting ? 'Saving...' : 'Save Competition'}
          </Button>
        </div>
        
        {error && <Alert type="error" message={error} className="mb-4" />}
        {success && <Alert type="success" message="Competition saved successfully!" className="mb-4" />}
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading competition data...</p>
          </div>
        ) : (
          <Card>
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center mb-4">
                      <Info size={18} className="text-blue-600 mr-2" />
                      <h2 className="text-lg font-medium">Basic Information</h2>
                    </div>
                    
                    <div className="space-y-4">
                      <InputField
                        label="Competition Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Enter competition name"
                        error={!validation.name}
                      />
        
                      <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">
                          Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          rows={4}
                          className={`border ${!validation.description ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 focus:ring-blue-500 focus:border-blue-500`}
                          placeholder="Enter competition description"
                        />
                        {!validation.description && (
                          <p className="mt-1 text-sm text-red-500">This field is required</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center mb-4">
                      <Clock size={18} className="text-blue-600 mr-2" />
                      <h2 className="text-lg font-medium">Schedule</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">
                          Start Time <span className="text-red-500">*</span>
                        </label>
                        <DateTimePicker
                          onChange={(value) => handleDateChange('start_time', value)}
                          value={formData.start_time}
                          className={`border ${!validation.start_time ? 'border-red-500' : 'border-gray-300'} rounded-md p-2`}
                          format="y-MM-dd h:mm a"
                          disableClock
                          clearIcon={null}
                          calendarIcon={<Calendar size={16} />}
                        />
                        {!validation.start_time && (
                          <p className="mt-1 text-sm text-red-500">Valid start time is required</p>
                        )}
                      </div>
        
                      <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">
                          End Time <span className="text-red-500">*</span>
                        </label>
                        <DateTimePicker
                          onChange={(value) => handleDateChange('end_time', value)}
                          value={formData.end_time}
                          className={`border ${!validation.end_time ? 'border-red-500' : 'border-gray-300'} rounded-md p-2`}
                          format="y-MM-dd h:mm a"
                          disableClock
                          clearIcon={null}
                          calendarIcon={<Calendar size={16} />}
                          minDate={formData.start_time}
                        />
                        {!validation.end_time && (
                          <p className="mt-1 text-sm text-red-500">End time must be after start time</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center mb-4">
                      <Globe size={18} className="text-blue-600 mr-2" />
                      <h2 className="text-lg font-medium">Competition Settings</h2>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center p-3 hover:bg-gray-50 rounded-md transition-colors">
                        <input
                          type="checkbox"
                          id="is_public"
                          name="is_public"
                          checked={formData.is_public}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="ml-3">
                          <label htmlFor="is_public" className="font-medium text-gray-700">
                            Public Competition
                          </label>
                          <p className="text-sm text-gray-500">
                            Make this competition visible to all users
                          </p>
                        </div>
                      </div>
        
                      <div className="flex items-center p-3 hover:bg-gray-50 rounded-md transition-colors">
                        <input
                          type="checkbox"
                          id="registration_required"
                          name="registration_required"
                          checked={formData.registration_required}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="ml-3">
                          <label htmlFor="registration_required" className="font-medium text-gray-700">
                            Require Registration
                          </label>
                          <p className="text-sm text-gray-500">
                            Users must register before participating in the competition
                          </p>
                        </div>
                      </div>
        
                      <div className="flex items-center p-3 hover:bg-gray-50 rounded-md transition-colors">
                        <input
                          type="checkbox"
                          id="leaderboard_visible"
                          name="leaderboard_visible"
                          checked={formData.leaderboard_visible}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="ml-3">
                          <label htmlFor="leaderboard_visible" className="font-medium text-gray-700">
                            Show Leaderboard
                          </label>
                          <p className="text-sm text-gray-500">
                            Make the competition leaderboard visible to participants
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};


export default CompetitionFormPage;