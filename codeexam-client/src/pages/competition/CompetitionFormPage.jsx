import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Save, ArrowLeft, Calendar, Globe, Plus, Trash2, GripVertical, BookOpen } from 'lucide-react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Alert } from '../../components/Alert';
import Sidebar from '../../components/Sidebar';
import DateTimePicker from 'react-datetime-picker';
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { InputField } from '../../components/inputfield';
import { ProblemManager } from '../../components/competition/ProblemManager';

const CompetitionFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get competition ID from URL if editing
  const isEditMode = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Get user data from Redux store
  const { token, userRole } = useSelector(state => state.auth);

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

  // Problem management state
  const [selectedProblems, setSelectedProblems] = useState([]);
  const [problemError, setProblemError] = useState(null);
  const [availableProblems, setAvailableProblems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');


  // Form validation state
  const [validation, setValidation] = useState({
    name: true,
    description: true,
    start_time: true,
    end_time: true
  });

  const handleProblemSelectionChange = (problems) => {
    setSelectedProblems(problems);
  };

    const handleAddProblem = async (problem) => {
    try {
      const headers = { Authorization: token ? `Bearer ${token}` : '' };
      const response = await axios.post(
        `/api/competitions/${id}/problems`,
        {
          problem_id: problem.id,
          order_index: selectedProblems.length
        },
        { headers }
      );

      if (response.data.success) {
        setSelectedProblems(prev => [...prev, { ...problem, order_index: prev.length }]);
        setAvailableProblems(prev => prev.filter(p => p.id !== problem.id));
        setProblemError(null);
      }
    } catch (err) {
      console.error('Error adding problem:', err);
      setProblemError('Failed to add problem to competition');
    }
  };

  const handleRemoveProblem = async (problemId) => {
    try {
      const headers = { Authorization: token ? `Bearer ${token}` : '' };
      await axios.delete(`/api/competitions/${id}/problems/${problemId}`, { headers });

      const removedProblem = selectedProblems.find(p => p.id === problemId);
      setSelectedProblems(prev => {
        const filtered = prev.filter(p => p.id !== problemId);
        return filtered.map((p, idx) => ({ ...p, order_index: idx }));
      });

      if (removedProblem) {
        setAvailableProblems(prev => [...prev, removedProblem]);
      }
    } catch (err) {
      console.error('Error removing problem:', err);
      setProblemError('Failed to remove problem from competition');
    }
  };

    const handleReorderProblems = async (sourceIndex, destinationIndex) => {
    try {
      const movedProblem = selectedProblems[sourceIndex];

      // Optimistically update UI
      const newProblems = Array.from(selectedProblems);
      newProblems.splice(sourceIndex, 1);
      newProblems.splice(destinationIndex, 0, movedProblem);

      // Update order indices
      const updatedProblems = newProblems.map((problem, index) => ({
        ...problem,
        order_index: index
      }));

      setSelectedProblems(updatedProblems);

      // Update in backend
      const headers = { Authorization: token ? `Bearer ${token}` : '' };
      await axios.put(
        `/api/competitions/${id}/problems/${movedProblem.id}`,
        { order_index: destinationIndex },
        { headers }
      );
    } catch (err) {
      console.error('Error reordering problems:', err);
      setProblemError('Failed to reorder problems');
      // Revert to original order on error
      await fetchCompetitionProblems();
    }
  };


  // Fetch competition data if in edit mode
  useEffect(() => {
    // Redirect if not admin
    if (userRole !== 'admin') {
      navigate('/competitions');
      return;
    }

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

        // Fetch competition problems if in edit mode
        await fetchCompetitionProblems();

        setError(null);
      } catch (err) {
        console.error('Error fetching competition:', err);
        setError('Failed to load competition data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompetitionData();
  }, [id, isEditMode, token, userRole, navigate]);

  // Fetch problems for this competition
  const fetchCompetitionProblems = async () => {
    if (!isEditMode) return;

    try {
      const headers = { Authorization: token ? `Bearer ${token}` : '' };
      const response = await axios.get(`/api/competitions/${id}/problems`, { headers });
      let problems = [];
      if (response.data.success) {
        // Sort problems by order_index
        problems = response.data.data || [];
        problems.sort((a, b) => a.order_index - b.order_index);
        setSelectedProblems(problems);
        setProblemError(null);
      } else {
        setProblemError('Failed to load competition problems');
        setSelectedProblems([]);
      }

      const allProblemsResponse = await axios.get('/api/problems', { headers });
      console.log({ allProblemsResponse });
      const allProblems = allProblemsResponse.data.problems || [];
      const competitionProblemIds = problems.map(p => p.problem_id);
      const availableProblems = allProblems.filter(p => !competitionProblemIds.includes(p.id));
      setAvailableProblems(availableProblems);


    } catch (err) {
      console.error('Error fetching competition problems:', err);
      setProblemError('Failed to load competition problems. Please try again later.');
      setSelectedProblems([]);
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null); // Clear any previous errors
    setSuccess(false);

    // Validation checks
    let isFormValid = true;
    const newValidation = { ...validation };

    if (!formData.name.trim()) {
      newValidation.name = false;
      isFormValid = false;
    }
    if (!formData.description.trim()) {
      newValidation.description = false;
      isFormValid = false;
    }
    if (formData.end_time <= formData.start_time) {
      newValidation.end_time = false;
      isFormValid = false;
    }

    setValidation(newValidation);

    if (!isFormValid) {
      setIsSubmitting(false);
      return; // Stop submission if validation fails
    }

    // Prepare data for API request
    const requestData = {
      ...formData,
      start_time: formData.start_time.toISOString(),
      end_time: formData.end_time.toISOString(),
      problem_ids: selectedProblems.map((p) => p.id), // Send only problem IDs
    };

    try {
      const headers = { Authorization: token ? `Bearer ${token}` : '' };
      let response;

      if (isEditMode) {
        // Update existing competition
        response = await axios.put(`/api/competitions/${id}`, requestData, { headers });
      } else {
        // Create new competition
        response = await axios.post('/api/competitions', requestData, { headers });
      }

      if (response.data.success) {
        setSuccess(true);
        setError(null);

        // Redirect to the competitions list after a delay
        setTimeout(() => {
          navigate('/competitions');
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to save competition');
      }
    } catch (err) {
      console.error('Error saving competition:', err);
      setError(err.response?.data?.message || 'An unexpected error occurred');
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
          <div className="space-y-6">
            <Card>
              <div className="p-6">
                {/* Main form, moved outside of handleSubmit to improve readability */}
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    {/* Competition Name */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Competition Name
                      </label>
                      <InputField
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter competition name"
                        className={`mt-1 ${!validation.name ? 'border-red-500' : ''}`}
                        required
                      />
                      {!validation.name && (
                        <p className="mt-1 text-sm text-red-500">Competition name is required</p>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        placeholder="Enter a detailed description of the competition"
                        className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${!validation.description ? 'border-red-500' : ''}`}
                        required
                      ></textarea>
                      {!validation.description && (
                        <p className="mt-1 text-sm text-red-500">Description is required</p>
                      )}
                    </div>

                    {/* Start and End Time */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="start_time" className="block text-sm font-medium text-gray-700">
                          Start Time
                        </label>
                        <div className="mt-1">
                          <DateTimePicker
                            onChange={(value) => handleDateChange('start_time', value)}
                            value={formData.start_time}
                            className={`border ${!validation.start_time ? 'border-red-500' : 'border-gray-300'} rounded-md p-2`}
                            format="y-MM-dd h:mm a"
                            disableClock
                            clearIcon={null}
                            calendarIcon={<Calendar size={16} />}
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="end_time" className="block text-sm font-medium text-gray-700">
                          End Time
                        </label>
                        <div className="mt-1">
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
                  </div>

                  {/* Competition Settings */}
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mt-6">
                    <div className="flex items-center mb-4">
                      <Globe size={18} className="text-blue-600 mr-2" />
                      <h2 className="text-lg font-medium">Competition Settings</h2>
                    </div>

                    <div className="space-y-4">
                      {/* Public Competition */}
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

                      {/* Require Registration */}
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

                      {/* Show Leaderboard */}
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

                  {/* Problem Management Section */}
                  <ProblemManager
                        availableProblems={availableProblems}
                        selectedProblems={selectedProblems}
                        onAddProblem={handleAddProblem}
                        onRemoveProblem={handleRemoveProblem}
                        onReorderProblems={handleReorderProblems}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        isLoading={isLoading}
                        problemError={problemError}
                        setProblemError={setProblemError}
                    />
                </form>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompetitionFormPage;
