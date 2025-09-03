import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { openCreateTaskModal, openAddMemberModal } from '../store/slices/uiSlice';
import { Plus, Users, Settings, MoreHorizontal } from 'lucide-react';

const BoardHeader = ({ board }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleCreateTask = () => {
    dispatch(openCreateTaskModal());
  };

  const handleAddMember = () => {
    dispatch(openAddMemberModal());
  };

  return (
    <div className="board-header">
      <div className="board-header-content">
        <div className="board-info">
          <h1 className="board-title">{board.title}</h1>
          {board.description && (
            <p className="board-description">{board.description}</p>
          )}
        </div>

        <div className="board-actions">
          {/* Board Members */}
          <div className="board-members">
            <div className="members-list">
              {board.members.slice(0, 4).map((member) => (
                <div
                  key={member._id}
                  className="member-avatar"
                  title={member.fullName || `${member.firstName} ${member.lastName}`}
                >
                  {(member.firstName?.[0] || '') + (member.lastName?.[0] || '')}
                </div>
              ))}
              {board.members.length > 4 && (
                <div className="member-avatar more">
                  +{board.members.length - 4}
                </div>
              )}
            </div>
            <button
              onClick={handleAddMember}
              className="add-member-btn"
              title="Add member"
            >
              <Users size={18} />
            </button>
          </div>

          {/* Actions */}
          <div className="action-buttons">
            <button
              onClick={handleCreateTask}
              className="add-task-btn-main"
            >
              <Plus size={18} />
              Add Task
            </button>
            
            <button className="action-btn">
              <Settings size={18} />
            </button>
            
            <button className="action-btn">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardHeader;
