import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { useDispatch } from 'react-redux';
import { openCreateTaskModal } from '../store/slices/uiSlice';
import TaskCard from './TaskCard';
import { Plus } from 'lucide-react';

const Column = ({ column, tasks, boardId }) => {
  const dispatch = useDispatch();

  const handleAddTask = () => {
    dispatch(openCreateTaskModal());
  };

  return (
    <div className="column-wrapper">
      <div className="kanban-column">
        {/* Column Header */}
        <div className="column-header">
          <div className="column-header-content">
            <div className="column-title-section">
              <div 
                className="column-color-dot"
                style={{ backgroundColor: column.color }}
              />
              <h3 className="column-title">{column.title}</h3>
              <span className="task-count">
                {tasks.length}
              </span>
            </div>
            <button
              onClick={handleAddTask}
              className="add-task-btn"
              title="Add task"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* Droppable Area */}
        <Droppable droppableId={column.id}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`column-content ${snapshot.isDraggingOver ? 'drag-over' : ''}`}
            >
              {tasks.length === 0 ? (
                <div className="empty-column">
                  <div className="empty-column-icon">
                    <Plus size={24} />
                  </div>
                  <p className="empty-column-text">No tasks yet</p>
                  <button
                    onClick={handleAddTask}
                    className="add-first-task-btn"
                  >
                    Add your first task
                  </button>
                </div>
              ) : (
                <div className="tasks-list">
                  {tasks.map((task, index) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      index={index}
                    />
                  ))}
                </div>
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
};

export default Column;
