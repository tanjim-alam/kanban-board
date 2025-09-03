import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Plus, 
  Home,
  Users,
  Settings
} from 'lucide-react';
import clsx from 'clsx';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { boards } = useSelector((state) => state.boards);
  const { sidebarCollapsed } = useSelector((state) => state.ui);

  const handleCreateBoard = () => {
    navigate('/create-board');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className={clsx('sidebar', sidebarCollapsed && 'collapsed')}>
      {/* Navigation */}
      <nav className="nav-section">
        <Link
          to="/"
          className={clsx('nav-link', isActive('/') && 'active')}
        >
          <Home size={20} className="nav-icon" />
          {!sidebarCollapsed && 'Dashboard'}
        </Link>
      </nav>

      {/* Boards Section */}
      <div className="boards-section">
        <div className="boards-header">
          {!sidebarCollapsed && (
            <h3 className="boards-title">Boards</h3>
          )}
          <button
            onClick={handleCreateBoard}
            className="create-board-btn"
            title="Create board"
          >
            <Plus size={18} />
          </button>
        </div>

        <div>
          {boards.map((board) => (
            <Link
              key={board._id}
              to={`/board/${board._id}`}
              className={clsx('board-link', isActive(`/board/${board._id}`) && 'active')}
            >
              <div className="board-dot" />
              {!sidebarCollapsed && (
                <span className="truncate">{board.title}</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
