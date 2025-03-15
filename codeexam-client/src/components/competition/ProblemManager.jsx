import React from 'react';
import { Plus, Trash2, GripVertical, Search } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export const ProblemManager = ({
  availableProblems,
  selectedProblems,
  onAddProblem,
  onRemoveProblem,
  onReorderProblems,
  searchTerm,
  onSearchChange,
  isLoading
}) => {
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    onReorderProblems(result.source.index, result.destination.index);
  };

  // Filter available problems based on search term
  const filteredProblems = availableProblems.filter(problem =>
    problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    problem.difficulty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Available Problems */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-md font-medium">Available Problems</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search problems..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {filteredProblems.map((problem) => (
              <div
                key={problem.id}
                className={`flex items-center justify-between p-3 mb-2 border rounded-md hover:bg-gray-50 ${
                  selectedProblems.some(p => p.id === problem.id) ? 'bg-blue-50 border-blue-300' : ''
                }`}
              >
                <div>
                  <p className="font-medium">{problem.title}</p>
                  <p className="text-sm text-gray-500">{problem.difficulty}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onAddProblem(problem)}
                  disabled={selectedProblems.some(p => p.id === problem.id)}
                  className={`p-2 rounded-full ${
                    selectedProblems.some(p => p.id === problem.id)
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-blue-600 hover:bg-blue-100'
                  }`}
                >
                  <Plus size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Problems */}
      <div className="border rounded-lg p-4">
        <h3 className="text-md font-medium mb-4">Selected Problems</h3>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable
            droppableId="selected-problems"
            isCombineEnabled={false}
          >
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="max-h-80 overflow-y-auto"
              >
                {selectedProblems && selectedProblems.map((problem, index) => (
                  <Draggable
                    key={`${problem.id}`}
                    draggableId={`${problem.id}`}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`flex items-center justify-between p-3 mb-2 border rounded-md bg-white ${
                          snapshot.isDragging ? 'shadow-lg' : ''
                        }`}
                      >
                        <div className="flex items-center">
                          <div {...provided.dragHandleProps} className="mr-2 cursor-grab">
                            <GripVertical size={16} className="text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium">{problem.title}</p>
                            <p className="text-sm text-gray-500">Order: {index + 1}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveProblem(problem.id)}
                          className="p-2 rounded-full text-red-600 hover:bg-red-100"
                        >
                          <Trash2 size={16} />
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
      </div>
    </div>
  );
};