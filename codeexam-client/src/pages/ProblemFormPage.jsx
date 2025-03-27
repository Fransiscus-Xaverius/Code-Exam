import React, { useState, useEffect } from 'react';
import { Save, HelpCircle, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar'; // Import the Sidebar component
import { useSelector } from 'react-redux'; // Import useSelector

import API from '../components/helpers/API'

const ProblemFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get problem ID from URL if editing
  const isEditMode = !!id;
  
  // Get auth state from Redux store
  const { userRole, token, user } = useSelector(state => state.auth);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'Medium',
    points: 100,
    time_limit_ms: 1000,
    memory_limit_kb: 262144, // 256MB default
    input_format: '',
    output_format: '',
    constraints: '',
    sample_input: '',
    sample_output: '',
    hidden_test_cases: ''
  });
  
  // Form validation state
  const [validation, setValidation] = useState({
    title: true,
    description: true,
    difficulty: true,
    points: true,
    time_limit_ms: true,
    memory_limit_kb: true
  });
  
  // Fetch problem data if in edit mode
  useEffect(() => {
    // Redirect if not admin
    if (userRole !== 'admin' && userRole !== 'judge') {
      navigate('/dashboard');
      return;
    }
    
    const fetchProblemData = async () => {
      if (!isEditMode) return;
      
      try {
        setIsLoading(true);
        
        const response = await API.get(`/api/problems/${id}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : ''
          }
        });
        
        // Populate form with existing data
        if (response.data.success) {
          setFormData(response.data.problem);
          setError(null);
        } else {
          setError(response.data.message || 'Failed to load problem data');
        }
      } catch (err) {
        console.error('Error fetching problem:', err);
        setError('Failed to load problem data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProblemData();
  }, [id, isEditMode, token, userRole, navigate]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when user types
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
      title: !!formData.title.trim(),
      description: !!formData.description.trim(),
      difficulty: ['Easy', 'Medium', 'Hard'].includes(formData.difficulty),
      points: Number(formData.points) > 0,
      time_limit_ms: Number(formData.time_limit_ms) > 0,
      memory_limit_kb: Number(formData.memory_limit_kb) > 0
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
      setError('Please fill in all required fields correctly.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Prepare numerical fields
      const submitData = {
        ...formData,
        points: Number(formData.points),
        time_limit_ms: Number(formData.time_limit_ms),
        memory_limit_kb: Number(formData.memory_limit_kb)
      };
      
      const headers = {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : ''
      };
      
      // Make API request based on mode (add or edit)
      if (isEditMode) {
        await API.put(`/api/problems/${id}`, submitData, { headers });
      } else {
        await API.post('/api/problems', submitData, { headers });
      }
      
      setSuccess(true);
      
      // Redirect after successful submission
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      
    } catch (err) {
      console.error('Error saving problem:', err);
      setError(err.response?.data?.message || 'Failed to save problem. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Field help tooltips
  const getTooltip = (field) => {
    const tooltips = {
      time_limit_ms: 'Maximum execution time in milliseconds',
      memory_limit_kb: 'Maximum memory usage in kilobytes',
      hidden_test_cases: 'JSON array of test cases used for judging but not shown to participants'
    };
    
    return tooltips[field] || '';
  };
  
  // Toggle role for demo purposes
  const toggleRole = () => {
    if (userRole === 'competitor') setUserRole('admin');
    else if (userRole === 'admin') setUserRole('judge');
    else setUserRole('competitor');
  };
  
  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('codeexam_token');
    window.location.href = '/login';
  };
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar 
        userRole={userRole} 
        toggleRole={toggleRole} 
        handleLogout={handleLogout} 
      />
      
      <div className="ml-64 flex-1 p-6">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/dashboard')}
              className="mr-4 p-2 rounded-full hover:bg-gray-200"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              {isEditMode ? 'Edit Problem' : 'Add New Problem'}
            </h1>
          </div>
          
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-green-500 text-white px-4 py-2 rounded flex items-center hover:bg-green-600 disabled:opacity-50 transition-colors duration-200"
          >
            {isSubmitting ? 'Saving...' : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Problem
              </>
            )}
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Problem {isEditMode ? 'updated' : 'created'} successfully! Redirecting...
          </div>
        )}
        
        {isLoading ? (
          <div className="bg-white rounded shadow-md p-8 text-center">
            <p className="text-gray-600">Loading problem data...</p>
          </div>
        ) : (
          <div className="bg-white rounded shadow-md overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b">
              <h2 className="font-semibold">Problem Details</h2>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left column - Basic details */}
                  <div className="space-y-6">
                    {/* Title */}
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className={`w-full rounded border ${!validation.title ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="e.g., Two Sum"
                      />
                      {!validation.title && <p className="text-red-500 text-xs mt-1">Title is required</p>}
                    </div>
                    
                    {/* Difficulty */}
                    <div>
                      <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                        Difficulty <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="difficulty"
                        name="difficulty"
                        value={formData.difficulty}
                        onChange={handleChange}
                        className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                    
                    {/* Points */}
                    <div>
                      <label htmlFor="points" className="block text-sm font-medium text-gray-700 mb-1">
                        Points <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        id="points"
                        name="points"
                        value={formData.points}
                        onChange={handleChange}
                        min="1"
                        className={`w-full rounded border ${!validation.points ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      {!validation.points && <p className="text-red-500 text-xs mt-1">Points must be a positive number</p>}
                    </div>
                    
                    {/* Time Limit */}
                    <div>
                      <label htmlFor="time_limit_ms" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        Time Limit (ms) <span className="text-red-500">*</span>
                        <div className="group relative ml-1">
                          <HelpCircle className="h-4 w-4 text-gray-400" />
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 hidden group-hover:block w-48">
                            {getTooltip('time_limit_ms')}
                          </div>
                        </div>
                      </label>
                      <input
                        type="number"
                        id="time_limit_ms"
                        name="time_limit_ms"
                        value={formData.time_limit_ms}
                        onChange={handleChange}
                        min="1"
                        className={`w-full rounded border ${!validation.time_limit_ms ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      {!validation.time_limit_ms && <p className="text-red-500 text-xs mt-1">Time limit must be a positive number</p>}
                    </div>
                    
                    {/* Memory Limit */}
                    <div>
                      <label htmlFor="memory_limit_kb" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        Memory Limit (KB) <span className="text-red-500">*</span>
                        <div className="group relative ml-1">
                          <HelpCircle className="h-4 w-4 text-gray-400" />
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 hidden group-hover:block w-48">
                            {getTooltip('memory_limit_kb')}
                          </div>
                        </div>
                      </label>
                      <input
                        type="number"
                        id="memory_limit_kb"
                        name="memory_limit_kb"
                        value={formData.memory_limit_kb}
                        onChange={handleChange}
                        min="1"
                        className={`w-full rounded border ${!validation.memory_limit_kb ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      {!validation.memory_limit_kb && <p className="text-red-500 text-xs mt-1">Memory limit must be a positive number</p>}
                    </div>
                  </div>
                  
                  {/* Right column - Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="10"
                      className={`w-full rounded border ${!validation.description ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Detailed problem description. You can use markdown."
                    />
                    {!validation.description && <p className="text-red-500 text-xs mt-1">Description is required</p>}
                  </div>
                </div>
                
                {/* Extended details section */}
                <div className="mt-8 border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-700 mb-4">Additional Details</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Input Format */}
                    <div>
                      <label htmlFor="input_format" className="block text-sm font-medium text-gray-700 mb-1">
                        Input Format
                      </label>
                      <textarea
                        id="input_format"
                        name="input_format"
                        value={formData.input_format}
                        onChange={handleChange}
                        rows="4"
                        className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe the input format"
                      />
                    </div>
                    
                    {/* Output Format */}
                    <div>
                      <label htmlFor="output_format" className="block text-sm font-medium text-gray-700 mb-1">
                        Output Format
                      </label>
                      <textarea
                        id="output_format"
                        name="output_format"
                        value={formData.output_format}
                        onChange={handleChange}
                        rows="4"
                        className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe the expected output format"
                      />
                    </div>
                    
                    {/* Constraints */}
                    <div>
                      <label htmlFor="constraints" className="block text-sm font-medium text-gray-700 mb-1">
                        Constraints
                      </label>
                      <textarea
                        id="constraints"
                        name="constraints"
                        value={formData.constraints}
                        onChange={handleChange}
                        rows="4"
                        className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="List all constraints (e.g., 1 ≤ n ≤ 10^5)"
                      />
                    </div>
                    
                    {/* Sample Input */}
                    <div>
                      <label htmlFor="sample_input" className="block text-sm font-medium text-gray-700 mb-1">
                        Sample Input
                      </label>
                      <textarea
                        id="sample_input"
                        name="sample_input"
                        value={formData.sample_input}
                        onChange={handleChange}
                        rows="4"
                        className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                        placeholder="Example input"
                      />
                    </div>
                    
                    {/* Sample Output */}
                    <div>
                      <label htmlFor="sample_output" className="block text-sm font-medium text-gray-700 mb-1">
                        Sample Output
                      </label>
                      <textarea
                        id="sample_output"
                        name="sample_output"
                        value={formData.sample_output}
                        onChange={handleChange}
                        rows="4"
                        className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                        placeholder="Expected output for the sample input"
                      />
                    </div>
                    
                    {/* Hidden Test Cases */}
                    <div className="lg:col-span-2">
                      <label htmlFor="hidden_test_cases" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        Hidden Test Cases
                        <div className="group relative ml-1">
                          <HelpCircle className="h-4 w-4 text-gray-400" />
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 hidden group-hover:block w-48">
                            {getTooltip('hidden_test_cases')}
                          </div>
                        </div>
                      </label>
                      <textarea
                        id="hidden_test_cases"
                        name="hidden_test_cases"
                        value={formData.hidden_test_cases}
                        onChange={handleChange}
                        rows="6"
                        className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                        placeholder='JSON array format: [{"input": "5\n1 2 3 4 5", "output": "15"}]'
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter as JSON array of objects with "input" and "output" properties
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Submit button (for mobile) */}
                <div className="mt-6 lg:hidden">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-green-500 text-white px-4 py-2 rounded flex items-center justify-center hover:bg-green-600 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Problem
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemFormPage;