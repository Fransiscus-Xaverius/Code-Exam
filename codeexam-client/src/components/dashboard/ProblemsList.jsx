import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, FileText, Plus } from 'lucide-react';
import { Button } from '../Button';
import { Card } from '../Card';
import { Pagination } from '../Pagination';
import DifficultyBadge from './DifficultyBadge';
import StatusIndicator from './StatusIndicator';

const ProblemsList = ({
    problems,
    isLoading,
    error,
    userRole,
    handleAddNewProblem,
    handleDeleteClick,
    currentPage,
    totalPages,
    setCurrentPage,
    renderSkeletonLoader,
    fetchProblems
}) => {
    const navigate = useNavigate();

    if (isLoading) {
        return renderSkeletonLoader();
    }

    if (error) {
        return (
            <Card className="p-6 text-center">
                <div className="text-red-500 mb-4">{error}</div>
                <Button onClick={fetchProblems}>Try Again</Button>
            </Card>
        );
    }

    if (problems.length === 0) {
        return (
            <Card className="p-8 text-center">
                <div className="text-gray-500 mb-4">No problems found</div>
                {(userRole === 'admin' || userRole === 'judge') && (
                    <Button
                        onClick={handleAddNewProblem}
                        className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ease-in-out rounded-lg shadow-sm hover:shadow-md"
                    >
                        <Plus size={18} className="mr-2" />
                        <span>Add New Problem</span>
                    </Button>
                )}
            </Card>
        );
    }

    // Mobile cards view
    const renderMobileCards = () => (
        <div className="space-y-4 md:hidden">
            {problems.map((problem) => (
                <div key={problem.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <h3 className="font-medium text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                                onClick={() => userRole === 'competitor' ? navigate(`/solve/${problem.id}`) : navigate(`/problem/${problem.id}`)}
                            >
                                {problem.title}
                            </h3>
                            <div className="flex items-center mt-2 space-x-2">
                                <DifficultyBadge difficulty={problem.difficulty} />
                                <span className="text-sm text-gray-500">{problem.points} pts</span>
                            </div>
                        </div>
                        {userRole === 'competitor' && <StatusIndicator solved={problem.solved} />}
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                        {(userRole === 'admin' || userRole === 'judge') ? (
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => navigate(`/problem/edit/${problem.id}`)}
                                    className="p-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                                    aria-label="Edit problem"
                                >
                                    <Edit size={16} />
                                </button>

                                {userRole === 'admin' && (
                                    <button
                                        onClick={() => handleDeleteClick(problem)}
                                        className="p-2 rounded-full bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                                        aria-label="Delete problem"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}

                                {userRole === 'judge' && (
                                    <button
                                        onClick={() => navigate(`/submissions/${problem.id}`)}
                                        className="p-2 rounded-full bg-yellow-50 hover:bg-yellow-100 text-yellow-600 transition-colors"
                                        aria-label="Review submissions"
                                    >
                                        <FileText size={16} />
                                    </button>
                                )}
                            </div>
                        ) : (
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => navigate(`/solve/${problem.id}`)}
                                className="text-sm px-4 py-2"
                            >
                                Solve Problem
                            </Button>
                        )}

                        {(userRole === 'admin' || userRole === 'judge') && (
                            <span className="text-xs text-gray-400">
                                {new Date(problem.created_at).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );

    // Desktop table view
    const renderDesktopTable = () => {
        const tableHeaders = {
            competitor: (
                <tr className="bg-gray-50 border-b">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
            ),
            admin: (
                <tr className="bg-gray-50 border-b">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
            ),
            judge: (
                <tr className="bg-gray-50 border-b">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submissions</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
            )
        };

        const renderTableRow = (problem) => {
            if (userRole === 'competitor') {
                return (
                    <>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <StatusIndicator solved={problem.solved} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 hover:text-blue-600 cursor-pointer transition-colors"
                                onClick={() => navigate(`/solve/${problem.id}`)}>
                                {problem.title}
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <DifficultyBadge difficulty={problem.difficulty} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {problem.points} points
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => navigate(`/solve/${problem.id}`)}
                                className="text-sm px-4 py-2"
                            >
                                Solve Problem
                            </Button>
                        </td>
                    </>
                );
            } else if (userRole === 'admin') {
                return (
                    <>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 hover:text-blue-600 cursor-pointer transition-colors"
                                onClick={() => navigate(`/problem/${problem.id}`)}>
                                {problem.title}
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <DifficultyBadge difficulty={problem.difficulty} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {problem.points} points
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(problem.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-3">
                                <button
                                    onClick={() => navigate(`/problem/edit/${problem.id}`)}
                                    className="group relative flex items-center justify-center p-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                                    title="Edit Problem"
                                >
                                    <Edit size={16} className="group-hover:scale-110 transition-transform duration-200" />
                                    <span className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                                        Edit Problem
                                    </span>
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(problem)}
                                    className="group relative flex items-center justify-center p-2 rounded-full bg-red-50 hover:bg-red-100 text-red-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                                    title="Delete Problem"
                                >
                                    <Trash2 size={16} className="group-hover:scale-110 transition-transform duration-200" />
                                    <span className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                                        Delete Problem
                                    </span>
                                </button>
                            </div>
                        </td>
                    </>
                );
            } else { // judge role
                return (
                    <>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 hover:text-blue-600 cursor-pointer transition-colors"
                                onClick={() => navigate(`/problem/${problem.id}`)}>
                                {problem.title}
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <DifficultyBadge difficulty={problem.difficulty} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {problem.points} points
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {problem.submissions || 0} total
                            {problem.pending_submissions > 0 && (
                                <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
                                    {problem.pending_submissions} pending
                                </span>
                            )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-3">
                                <button
                                    onClick={() => navigate(`/problem/edit/${problem.id}`)}
                                    className="group relative flex items-center justify-center p-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                                    title="Edit Problem"
                                >
                                    <Edit size={16} className="group-hover:scale-110 transition-transform duration-200" />
                                    <span className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                                        Edit Problem
                                    </span>
                                </button>
                                <button
                                    onClick={() => navigate(`/submissions/${problem.id}`)}
                                    className="group relative flex items-center justify-center p-2 rounded-full bg-yellow-50 hover:bg-yellow-100 text-yellow-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-1"
                                    title="Review Submissions"
                                >
                                    <FileText size={16} className="group-hover:scale-110 transition-transform duration-200" />
                                    <span className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                                        Review Submissions
                                    </span>
                                </button>
                            </div>
                        </td>
                    </>
                );
            }
        };

        return (
            <div className="hidden md:block overflow-hidden bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            {tableHeaders[userRole]}
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {problems.map((problem) => (
                                <tr key={problem.id} className="hover:bg-gray-50 transition-colors">
                                    {renderTableRow(problem)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <>
            {renderMobileCards()}
            {renderDesktopTable()}

            {totalPages > 1 && (
                <div className="mt-6">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}
        </>
    );
};

export default ProblemsList;