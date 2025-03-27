import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, UserPlus, X, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { Alert } from './Alert';

import API from '../components/helpers/API'

const CompetitionParticipantsManager = ({ competitionId, token }) => {
  const [participants, setParticipants] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddParticipant, setShowAddParticipant] = useState(false);

  useEffect(() => {
    fetchData();
  }, [competitionId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: token ? `Bearer ${token}` : '' };
      
      // Fetch participants already in the competition
      const participantsRes = await API.get(
        `/api/competitions/${competitionId}/participants`,
        { headers }
      );
      
      setParticipants(participantsRes.data.data || []);
      
      // Only fetch available users when needed
      if (showAddParticipant) {
        await fetchAvailableUsers();
      }
      
    } catch (err) {
      console.error('Error fetching participants:', err);
      setError('Failed to load participants');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const headers = { Authorization: token ? `Bearer ${token}` : '' };
      
      // Fetch all users
      const usersRes = await API.get('/api/users', { headers });
      
      // Filter out users already in the competition
      const participantUserIds = new Set(
        participants.map(p => p.user_id)
      );
      
      setAvailableUsers(
        usersRes.data.data.filter(u => !participantUserIds.has(u.id))
      );
      
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load available users');
    }
  };

  const handleAddParticipant = async (userId) => {
    try {
      setSaving(true);
      const headers = { Authorization: token ? `Bearer ${token}` : '' };
      
      // Add participant to competition
      const response = await API.post(
        `/api/competitions/${competitionId}/participants`,
        { user_id: userId },
        { headers }
      );
      
      // Move user from available to participants
      const userToAdd = availableUsers.find(u => u.id === userId);
      const newParticipant = response.data.data;
      
      setParticipants([...participants, { 
        ...newParticipant, 
        user: userToAdd 
      }]);
      
      setAvailableUsers(availableUsers.filter(u => u.id !== userId));
      
    } catch (err) {
      console.error('Error adding participant:', err);
      setError('Failed to add participant');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveParticipant = async (participantId, userId) => {
    try {
      setSaving(true);
      const headers = { Authorization: token ? `Bearer ${token}` : '' };
      
      // Remove participant from competition
      await API.delete(
        `/api/competitions/${competitionId}/participants/${participantId}`,
        { headers }
      );
      
      // Move user from participants to available
      const participantToRemove = participants.find(p => p.id === participantId);
      if (participantToRemove && participantToRemove.user) {
        setAvailableUsers([...availableUsers, participantToRemove.user]);
      }
      
      setParticipants(participants.filter(p => p.id !== participantId));
      
    } catch (err) {
      console.error('Error removing participant:', err);
      setError('Failed to remove participant');
    } finally {
      setSaving(false);
    }
  };

  const toggleAddParticipant = async () => {
    const newState = !showAddParticipant;
    setShowAddParticipant(newState);
    
    if (newState && availableUsers.length === 0) {
      await fetchAvailableUsers();
    }
  };

  const filteredAvailableUsers = availableUsers.filter(
    user => user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && !showAddParticipant) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading participants...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && <Alert type="error" message={error} />}
      
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Competition Participants</h3>
            <Button 
              onClick={toggleAddParticipant}
              variant={showAddParticipant ? "secondary" : "primary"}
              size="sm"
            >
              {showAddParticipant ? 'Done' : 'Add Participant'}
            </Button>
          </div>
          
          {!showAddParticipant ? (
            <>
              {participants.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No participants in this competition yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {participants.map((participant) => (
                    <tr key={participant.id || `${participant.user_id}-${competitionId}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {participant.user?.username || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {participant.user?.email || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(participant.registered_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleRemoveParticipant(participant.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                ))}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading users...</p>
                </div>
              ) : filteredAvailableUsers.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No available users found</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredAvailableUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <h4 className="font-medium">{user.username}</h4>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddParticipant(user.id)}
                        className="p-1 text-gray-400 hover:text-green-500 rounded-full hover:bg-gray-100"
                        disabled={saving}
                      >
                        <UserPlus size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default CompetitionParticipantsManager;
