import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { useDispatch } from 'react-redux';
import { format } from 'date-fns';
import { openTaskDetailsModal } from '../store/slices/uiSlice';
import { User, Calendar, Tag, MessageCircle } from 'lucide-react';
import clsx from 'clsx';

const TaskCard = ({ task, index }) => {
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(openTaskDetailsModal(task._id));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'priority-high';
      case 'high':
        return 'priority-medium';
      case 'medium':
        return 'priority-low';
      case 'low':
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={handleClick}
          className={`task-card ${snapshot.isDragging ? 'dragging' : ''} ${isOverdue ? 'overdue' : ''}`}
        >
          {/* Task Title */}
          <h4 className="task-title">
            {task.title}
          </h4>

          {/* Task Description */}
          {task.description && (
            <p className="task-description">
              {task.description}
            </p>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="task-tags">
              {task.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="task-tag">
                  <Tag size={10} />
                  {tag}
                </span>
              ))}
              {task.tags.length > 3 && (
                <span className="task-tag-more">
                  +{task.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Priority and Due Date */}
          <div className="task-meta">
            <span className={`priority-badge ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
            
            {task.dueDate && (
              <div className={`due-date ${isOverdue ? 'overdue' : ''}`}>
                <Calendar size={12} />
                {format(new Date(task.dueDate), 'MMM dd')}
              </div>
            )}
          </div>

          {/* Assignees and Comments */}
          <div className="task-footer">
            {/* Assignees */}
            <div className="assignees">
              {task.assignees && task.assignees.length > 0 ? (
                <div className="assignees-list">
                  {task.assignees.slice(0, 3).map((assignee, index) => (
                    <div
                      key={assignee._id}
                      className="assignee-avatar"
                      title={assignee.fullName || `${assignee.firstName} ${assignee.lastName}`}
                    >
                      {(assignee.firstName?.[0] || '') + (assignee.lastName?.[0] || '')}
                    </div>
                  ))}
                  {task.assignees.length > 3 && (
                    <div className="assignee-avatar more">
                      +{task.assignees.length - 3}
                    </div>
                  )}
                </div>
              ) : (
                <div className="unassigned">
                  <User size={14} />
                  <span>Unassigned</span>
                </div>
              )}
            </div>

            {/* Comments Count */}
            {task.comments && task.comments.length > 0 && (
              <div className="comments-count">
                <MessageCircle size={14} />
                <span>{task.comments.length}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;
