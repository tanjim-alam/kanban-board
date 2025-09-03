import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../store/slices/authSlice';
import { User, LogOut, Settings } from 'lucide-react';

const Navbar = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        {/* Logo */}
        <div className="logo-section">
          <div className="logo-icon">K</div>
          <h1 className="logo-text">Kanban Board</h1>
        </div>

        {/* User Menu */}
        <div className="user-section">
          <div className="user-info">
            <div className="user-avatar">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <span className="user-name">
              {user?.fullName || `${user?.firstName} ${user?.lastName}`}
            </span>
          </div>
          
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
