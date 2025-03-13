import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Save } from 'lucide-react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { InputField } from '../../components/InputField';
import { Alert } from '../../components/Alert';
import Sidebar from '../../components/Sidebar';

const CompetitionFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const { userRole } = useSelector(state => state.auth);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_time: '',
    end_time: '',
    is_public: true,
    registration_required: true,
    leaderboard_visible: true
  });

  useEffect(() => {
    if (isEditMode) {
      fetchCompetitionData();
    }
  }, [id]);

  const fetchCompetitionData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('codeexam_token');
      const response = await axios.get(`/api/competitions/${id}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });
      
      const competition = response.data.data;
      setFormData({
        ...competition,
        start_time: new Date(competition.start_time).toISOString().slice(0, 16),
        end_time: new Date(competition.end_time).toISOString().slice(0, 16)
      });
    } catch (err) {
      setError('Failed to load competition data. Please try again.');
      console.error('Error fetching competition:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Competition name is required');
      return false;
    }

    if (!formData.start_time || !formData.end_time) {
      setError('Start and end times are required');
      return false;
    }

    const start = new Date(formData.start_time);
    const end = new Date(formData.end_time);
    
    if (start >= end) {
      setError('End time must be after start time');
      return false;
    }
    return true;
  };
  
  // Update form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString()
      };
      
      setError(null);
      
      const token = localStorage.getItem('codeexam_token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        }
      };

      if (isEditMode) {
        await axios.put(`/api/competitions/${id}`, formData, config);
      } else {
        await axios.post('/api/competitions', formData, config);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/competitions');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save competition. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (userRole !== 'admin') {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="ml-64 flex-1 p-6">
          <Alert type="error" message="You are not authorized to access this page." />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="ml-64 flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              {isEditMode ? 'Edit Competition' : 'Create Competition'}
            </h1>

            {error && <Alert type="error" message={error} className="mb-4" />}
            {success && <Alert type="success" message="Competition saved successfully!" className="mb-4" />}

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading competition data...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <InputField
                    label="Competition Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter competition name"
                  />

                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      className="border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter competition description"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      label="Start Time"
                      type="datetime-local"
                      name="start_time"
                      value={formData.start_time}
                      onChange={handleChange}
                      required
                    />

                    <InputField
                      label="End Time"
                      type="datetime-local"
                      name="end_time"
                      value={formData.end_time}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_public"
                        name="is_public"
                        checked={formData.is_public}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="is_public" className="ml-2 text-sm text-gray-700">
                        Make competition public
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="registration_required"
                        name="registration_required"
                        checked={formData.registration_required}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="registration_required" className="ml-2 text-sm text-gray-700">
                        Require registration
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="leaderboard_visible"
                        name="leaderboard_visible"
                        checked={formData.leaderboard_visible}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="leaderboard_visible" className="ml-2 text-sm text-gray-700">
                        Show leaderboard
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => navigate('/competitions')}
                      className="mr-4"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="flex items-center"
                    >
                      <Save className="h-5 w-5 mr-2" />
                      {submitting ? 'Saving...' : 'Save Competition'}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CompetitionFormPage;