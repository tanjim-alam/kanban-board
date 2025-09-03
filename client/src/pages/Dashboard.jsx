import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Calendar, Clock } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { boards } = useSelector((state) => state.boards);
  const { user } = useSelector((state) => state.auth);

  const handleCreateBoard = () => {
    navigate('/create-board');
  };

  const getRecentBoards = () => {
    return boards.slice(0, 6);
  };

  const getTotalTasks = () => {
    // This would need to be calculated from tasks data
    return 0;
  };

  return (
    <div className="dashboard">
      {/* Welcome Section */}
      <div className="welcome-section">
        <h1 className="welcome-title">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="welcome-subtitle">
          Manage your projects and stay organized with your Kanban boards.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-icon blue">
              <Users size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Total Boards</p>
              <p className="stat-value">{boards.length}</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-icon green">
              <Calendar size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Total Tasks</p>
              <p className="stat-value">{getTotalTasks()}</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-icon orange">
              <Clock size={24} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Active Projects</p>
              <p className="stat-value">{boards.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Boards */}
      <div className="boards-section">
        <div className="boards-header">
          <h2 className="boards-title">Recent Boards</h2>
          <button
            onClick={handleCreateBoard}
            className="create-board-btn-main"
          >
            <Plus size={18} />
            Create Board
          </button>
        </div>

        <div className="boards-content">
          {boards.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <Users size={32} />
              </div>
              <h3 className="empty-title">No boards yet</h3>
              <p className="empty-subtitle">
                Create your first board to start organizing your projects.
              </p>
              <button
                onClick={handleCreateBoard}
                className="create-board-btn-main"
              >
                <Plus size={18} />
                Create Your First Board
              </button>
            </div>
          ) : (
            <div className="boards-grid">
              {getRecentBoards().map((board) => (
                <Link
                  key={board._id}
                  to={`/board/${board._id}`}
                  className="board-card"
                >
                  <div className="board-card-header">
                    <h3 className="board-card-title">
                      {board.title}
                    </h3>
                    <div className="board-card-dot" />
                  </div>
                  
                  {board.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {board.description}
                    </p>
                  )}

                  <div className="board-card-meta">
                    <div className="board-card-meta-item">
                      <Users size={14} />
                      <span>{board.members?.length || 0} members</span>
                    </div>
                    <div className="board-card-meta-item">
                      <Calendar size={14} />
                      <span>{new Date(board.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
