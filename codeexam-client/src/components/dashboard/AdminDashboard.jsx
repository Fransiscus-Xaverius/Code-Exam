import React from 'react';
import { BarChart2, Users, Calendar } from 'lucide-react';
import { Card } from '../../components/Card';

const AdminDashboard = () => {
  return (
    <Card className="p-4 mb-6 animate-fadeIn">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900">Admin Dashboard</h2>
        <p className="text-sm text-gray-500">System overview and statistics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-indigo-50 p-3 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Users</p>
              <p className="text-xl font-bold">548</p>
            </div>
            <Users size={24} className="text-indigo-400" />
          </div>
          <p className="text-xs text-gray-500 mt-2">+24 this month</p>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600 mb-1">Problems Created</p>
              <p className="text-xl font-bold">78</p>
            </div>
            <BarChart2 size={24} className="text-blue-400" />
          </div>
          <p className="text-xs text-gray-500 mt-2">+12 this month</p>
        </div>

        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Competitions</p>
              <p className="text-xl font-bold">3</p>
            </div>
            <Calendar size={24} className="text-purple-400" />
          </div>
          <p className="text-xs text-gray-500 mt-2">Next: Spring Challenge</p>
        </div>
      </div>
    </Card>
  );
};

export default AdminDashboard;