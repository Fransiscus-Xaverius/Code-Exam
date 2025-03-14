import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Plus, X, GripVertical, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { Alert } from './Alert';

const CompetitionProblemsManager = ({ competitionId, token }) => {
  const [problems, setProblems] = useState([]);
  const [availableProblems, setAvailableProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, [competitionId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: token ? `Bearer ${token}` : '' };
      
      // Fetch competition problems
      const problemsResponse = await axios.get(`/api/competitions/${competitionId}/problems`, { headers });
      
      // Fetch all problems for selection
      const allProblemsResponse = await axios.get('/api/problems', { headers });
      
      // Ensure we have valid data before filtering
      const competitionProblems = problemsResponse.data.data || [];
      const allProblems = allProblemsResponse.data.problems || [];
      
      // Set competition problems
      setCompetitionProblems(competitionProblems);
      
      // Filter out problems already in the competition
      const competitionProblemIds = competitionProblems.map(p => p.problem_id);
      const availableProblems = allProblems.filter(p => !competitionProblemIds.includes(p.id));
      
      setAvailableProblems(availableProblems);
      setError(null);
    } catch (err) {
      console.error('Error fetching problems:', err);
      setError('Failed to load problems');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProblem = async (problemId) => {
    try {
      setSaving(true);
      const headers = { Authorization: token ? `Bearer ${token}` : '' };
      
      await axios.post(
        `/api/competitions/${competitionId}/problems`,
        { problem_id: problemId, order_index: problems.length },
        { headers }
      );
      
      // Move problem from available to selected
      const problemToAdd = availableProblems.find(p => p.id === problemId);
      setProblems([...problems, { problem: problemToAdd, problem_id: problemId, order_index: problems.length }]);
      setAvailableProblems(availableProblems.filter(p => p.id !== problemId));
      
    } catch (err) {
      console.error('Error adding problem:', err);
      setError('Failed to add problem');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveProblem = async (problemId) => {
    try {
      setSaving(true);
      const headers = { Authorization: token ? `Bearer ${token}` : '' };
      
      await axios.delete(
        `/api/competitions/${competitionId}/problems/${problemId}`,
        { headers }
      );
      
      // Move problem from selected to available
      const problemToRemove = problems.find(p => p.problem_id === problemId);
      if (problemToRemove && problemToRemove.problem) {
        setAvailableProblems([...availableProblems, problemToRemove.problem]);
      }
      setProblems(problems.filter(p => p.problem_id !== problemId));
      
    } catch (err) {
      console.error('Error removing problem:', err);
      setError('Failed to remove problem');
    } finally {
      setSaving(false);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    
    const items = Array.from(problems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update local state with new order
    const updatedProblems = items.map((item, index) => ({
      ...item,
      order_index: index
    }));
    
    setProblems(updatedProblems);
    
    try {
      setSaving(true);
      const headers = { Authorization: token ? `Bearer ${token}` : '' };
      
      // Update order indices on the server
      await Promise.all(
        updatedProblems.map((p) => 
          axios.put(
            `/api/competitions/${competitionId}/problems/${p.problem_id}`,
            { order_index: p.order_index },
            { headers }
          )
        )
      );
    } catch (err) {
      console.error('Error updating problem order:', err);
      setError('Failed to update problem order');
    } finally {
      setSaving(false);
    }
  };

  const filteredAvailableProblems = availableProblems.filter(
    problem => problem.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading problems...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && <Alert type="error" message={error} />}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Selected Problems */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Competition Problems</h3>
            
            {problems.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No problems added to this competition yet</p>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="problems">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-3"
                    >
                      {problems.map((problem, index) => (
                        <Draggable 
                          key={problem.problem_id.toString()} 
                          draggableId={problem.problem_id.toString()} 
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm"
                            >
                              <div className="flex items-center">
                                <div {...provided.dragHandleProps} className="mr-3 text-gray-400">
                                  <GripVertical size={18} />
                                </div>
                                <div>
                                  <h4 className="font-medium">{problem.problem?.title || 'Unknown Problem'}</h4>
                                  <div className="flex items-center mt-1 space-x-2">
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                      problem.problem?.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                                      problem.problem?.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {problem.problem?.difficulty || 'Unknown'}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {problem.problem?.points || 0} points
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => handleRemoveProblem(problem.problem_id)}
                                className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100"
                                disabled={saving}
                              >
                                <X size={18} />
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>
        </Card>
        
        {/* Available Problems */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Available Problems</h3>
            
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search problems..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            {filteredAvailableProblems.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No available problems found</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredAvailableProblems.map((problem) => (
                  <div
                    key={problem.id}
                    className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{problem.title}</h4>
                      <div className="flex items-center mt-1 space-x-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                          problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {problem.difficulty}
                        </span>
                        <span className="text-xs text-gray-500">
                          {problem.points} points
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddProblem(problem.id)}
                      className="p-1 text-gray-400 hover:text-green-500 rounded-full hover:bg-gray-100"
                      disabled={saving}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CompetitionProblemsManager;