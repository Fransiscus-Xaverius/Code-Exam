import React from 'react';
import { FileText } from 'lucide-react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';

const JudgeDashboard = ({ pendingSubmissions, handleReviewSubmissions }) => {
  return (
    <Card className="p-4 mb-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Judge Dashboard</h2>
          <p className="text-sm text-gray-500">Pending submissions require your review</p>
        </div>
        {pendingSubmissions > 0 && (
          <Button
            onClick={handleReviewSubmissions}
            className="mt-3 sm:mt-0 w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600"
          >
            <FileText size={18} className="mr-2" />
            Review Pending ({pendingSubmissions})
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-yellow-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Pending Reviews</p>
          <p className="text-xl font-bold">{pendingSubmissions}</p>
        </div>

        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Reviews Today</p>
          <p className="text-xl font-bold">12</p>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Total Reviews</p>
          <p className="text-xl font-bold">438</p>
        </div>
      </div>
    </Card>
  );
};

export default JudgeDashboard;