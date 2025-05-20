import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Star, MessageCircle, AlertCircle, X, ChevronDown, ChevronUp, Award, Monitor, Trophy, Info } from 'lucide-react';
import API from '../components/helpers/API';
import Sidebar from '../components/Sidebar';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

const FeedbackPage = () => {
  // Form state
  const [formData, setFormData] = useState({
    content: '',
    rating: 5,
    category: 'general',
    problem_id: '',
    competition_id: '',
    is_anonymous: false
  });

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [problems, setProblems] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [showOptions, setShowOptions] = useState(false);

  // Get user data from Redux store
  const { user, token, userRole } = useSelector(state => state.auth);

  // Fetch available problems and competitions
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) return;

        const headers = { Authorization: `Bearer ${token}` };
        
        // Fetch problems
        const problemsRes = await API.get('/api/problems', { headers });
        if (problemsRes.data.success) {
          setProblems(problemsRes.data.problems || []);
        }
        
        // Fetch competitions
        const competitionsRes = await API.get('/api/competitions', { headers });
        if (competitionsRes.data.success) {
          setCompetitions(competitionsRes.data.data || []);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [token]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle rating selection
  const handleRatingClick = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      const payload = {
        ...formData,
        // Only include problem_id if category is 'problem' and a value is selected
        problem_id: formData.category === 'problem' && formData.problem_id ? formData.problem_id : null,
        // Only include competition_id if category is 'competition' and a value is selected
        competition_id: formData.category === 'competition' && formData.competition_id ? formData.competition_id : null
      };

      const response = await API.post('/api/feedbacks', payload, { headers });
      
      if (response.data.success) {
        setSuccess(true);
        // Reset form
        setFormData({
          content: '',
          rating: 5,
          category: 'general',
          problem_id: '',
          competition_id: '',
          is_anonymous: false
        });
      } else {
        setError(response.data.message || 'Failed to submit feedback');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while submitting feedback');
      console.error('Error submitting feedback:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render stars for rating
  const renderStars = () => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingClick(star)}
            className={`focus:outline-none ${
              star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'
            } hover:text-yellow-400 transition-colors duration-150`}
          >
            <Star className="h-8 w-8 fill-current" />
          </button>
        ))}
      </div>
    );
  };

  // Get icon based on category
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'problem':
        return <MessageCircle className="h-5 w-5" />;
      case 'platform':
        return <Monitor className="h-5 w-5" />;
      case 'competition':
        return <Trophy className="h-5 w-5" />;
      case 'general':
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 md:ml-64 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Provide Feedback</h1>
            <p className="mt-1 text-sm text-gray-600">
              We value your feedback to improve our platform and services.
            </p>
          </div>

          <Card className="p-6">
            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-start">
                <div className="flex-shrink-0">
                  <Award className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="font-medium">Thank you for your feedback!</p>
                  <p className="text-sm">Your input helps us improve the platform for everyone.</p>
                </div>
                <button
                  className="ml-auto text-green-500 hover:text-green-700"
                  onClick={() => setSuccess(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div className="ml-3">
                  <p className="font-medium">Error submitting feedback</p>
                  <p className="text-sm">{error}</p>
                </div>
                <button
                  className="ml-auto text-red-500 hover:text-red-700"
                  onClick={() => setError(null)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feedback Category
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      className="w-full flex items-center justify-between bg-white border border-gray-300 rounded-md px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onClick={() => setShowOptions(!showOptions)}
                    >
                      <span className="flex items-center">
                        {getCategoryIcon(formData.category)}
                        <span className="ml-2 capitalize">
                          {formData.category} Feedback
                        </span>
                      </span>
                      {showOptions ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    
                    {showOptions && (
                      <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1">
                        {['general', 'problem', 'platform', 'competition'].map((category) => (
                          <button
                            key={category}
                            type="button"
                            className={`w-full text-left px-4 py-2 flex items-center hover:bg-gray-100 ${
                              formData.category === category ? 'bg-blue-50 text-blue-700' : ''
                            }`}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, category }));
                              setShowOptions(false);
                            }}
                          >
                            {getCategoryIcon(category)}
                            <span className="ml-2 capitalize">{category} Feedback</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Specific Problem or Competition Selection */}
                {formData.category === 'problem' && (
                  <div>
                    <label htmlFor="problem_id" className="block text-sm font-medium text-gray-700 mb-2">
                      Select Problem
                    </label>
                    <select
                      id="problem_id"
                      name="problem_id"
                      value={formData.problem_id}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">-- Select a problem --</option>
                      {problems.map(problem => (
                        <option key={problem.id} value={problem.id}>
                          {problem.title} ({problem.difficulty})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.category === 'competition' && (
                  <div>
                    <label htmlFor="competition_id" className="block text-sm font-medium text-gray-700 mb-2">
                      Select Competition
                    </label>
                    <select
                      id="competition_id"
                      name="competition_id"
                      value={formData.competition_id}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">-- Select a competition --</option>
                      {competitions.map(competition => (
                        <option key={competition.id} value={competition.id}>
                          {competition.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <div className="flex items-center">
                    {renderStars()}
                    <span className="ml-2 text-gray-700">{formData.rating}/5</span>
                  </div>
                </div>

                {/* Feedback Content */}
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Feedback
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    rows="5"
                    value={formData.content}
                    onChange={handleChange}
                    required
                    placeholder="Please provide your feedback, suggestions, or report any issues you've encountered..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  ></textarea>
                </div>

                {/* Anonymous Option */}
                <div className="flex items-center">
                  <input
                    id="is_anonymous"
                    name="is_anonymous"
                    type="checkbox"
                    checked={formData.is_anonymous}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_anonymous" className="ml-2 block text-sm text-gray-700">
                    Submit anonymously (your name will not be visible to administrators)
                  </label>
                </div>

                {/* Submit Button */}
                <div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;