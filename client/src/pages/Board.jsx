import React, { useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { 
  fetchBoard, 
  updateBoardOptimistically, 
  revertBoardUpdate 
} from '../store/slices/boardsSlice';
import { 
  fetchTasks,
  moveTask, 
  moveTaskOptimistically, 
  revertTaskMove, 
  clearOptimisticUpdate 
} from '../store/slices/tasksSlice';
import { joinBoard, leaveBoard, emitTaskUpdate } from '../utils/socket';
import { setDragging, clearDragState } from '../store/slices/uiSlice';

// Components
import Column from '../components/Column';
import CreateTaskModal from '../components/CreateTaskModal';
import TaskDetailsModal from '../components/TaskDetailsModal';
import LoadingSpinner from '../components/LoadingSpinner';
import BoardHeader from '../components/BoardHeader';

const Board = () => {
  const { boardId } = useParams();
  const dispatch = useDispatch();
  
  const { currentBoard, isLoading: boardLoading } = useSelector((state) => state.boards);
  const { tasks, isLoading: tasksLoading } = useSelector((state) => state.tasks);
  const { isCreateTaskModalOpen, isTaskDetailsModalOpen, selectedTaskId } = useSelector((state) => state.ui);

  // Fetch board and tasks on mount
  useEffect(() => {
    if (boardId) {
      dispatch(fetchBoard(boardId));
      dispatch(fetchTasks(boardId));
    }
  }, [boardId, dispatch]);

  // Socket connection management
  useEffect(() => {
    if (boardId) {
      joinBoard(boardId);
      return () => {
        leaveBoard(boardId);
      };
    }
  }, [boardId]);

  // Handle drag end with optimistic updates
  const handleDragEnd = useCallback(async (result) => {
    dispatch(clearDragState());

    const { destination, source, draggableId } = result;

    // If dropped outside a droppable area
    if (!destination) {
      return;
    }

    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const taskId = draggableId;
    const sourceColumnId = source.droppableId;
    const destinationColumnId = destination.droppableId;
    const sourceIndex = source.index;
    const destinationIndex = destination.index;

    // Store original state for rollback
    const originalTask = tasks[boardId]?.find(t => t._id === taskId);
    if (!originalTask) return;

    const originalState = {
      columnId: originalTask.columnId,
      position: originalTask.position
    };

    // Optimistic update
    dispatch(moveTaskOptimistically({
      taskId,
      sourceColumnId,
      destinationColumnId,
      sourceIndex,
      destinationIndex
    }));

    try {
      // Update task position on server
      const resultAction = await dispatch(moveTask({
        taskId,
        columnId: destinationColumnId,
        position: destinationIndex
      }));

      if (moveTask.fulfilled.match(resultAction)) {
        // Success - emit socket event for real-time updates
        emitTaskUpdate({
          boardId,
          task: resultAction.payload
        });
        
        // Clear optimistic update
        dispatch(clearOptimisticUpdate({ taskId }));
        
        toast.success('Task moved successfully');
      } else {
        // Failed - revert optimistic update
        dispatch(revertTaskMove({ taskId }));
        toast.error(resultAction.payload || 'Failed to move task');
      }
    } catch (error) {
      // Failed - revert optimistic update
      dispatch(revertTaskMove({ taskId }));
      toast.error('Failed to move task');
    }
  }, [dispatch, boardId, tasks]);

  const handleDragStart = useCallback((start) => {
    dispatch(setDragging(true));
  }, [dispatch]);

  const handleDragUpdate = useCallback((update) => {
    // You can add visual feedback here if needed
  }, []);

  if (boardLoading || tasksLoading) {
    return (
      <div className="loading-spinner" style={{ minHeight: '400px' }}>
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!currentBoard) {
    return (
      <div className="text-center" style={{ padding: '3rem 0' }}>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Board not found</h2>
        <p className="text-gray-600">The board you're looking for doesn't exist or you don't have access to it.</p>
      </div>
    );
  }

  const boardTasks = tasks[boardId] || [];

  return (
    <div className="board-container">
      <BoardHeader board={currentBoard} />
      
      <div className="kanban-board">
        <DragDropContext
          onDragStart={handleDragStart}
          onDragUpdate={handleDragUpdate}
          onDragEnd={handleDragEnd}
        >
          <div className="columns-container">
            {currentBoard.columnOrder.map((columnId) => {
              const column = currentBoard.columns.find(col => col.id === columnId);
              if (!column) return null;

              const columnTasks = boardTasks
                .filter(task => task.columnId === columnId)
                .sort((a, b) => a.position - b.position);

              return (
                <Column
                  key={column.id}
                  column={column}
                  tasks={columnTasks}
                  boardId={boardId}
                />
              );
            })}
          </div>
        </DragDropContext>
      </div>

      {/* Modals */}
      {isCreateTaskModalOpen && (
        <CreateTaskModal boardId={boardId} />
      )}
      
      {isTaskDetailsModalOpen && selectedTaskId && (
        <TaskDetailsModal taskId={selectedTaskId} />
      )}
    </div>
  );
};

export default Board;
