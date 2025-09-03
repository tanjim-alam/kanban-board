import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser } from './store/slices/authSlice';
import { fetchBoards } from './store/slices/boardsSlice';
import { setupSocketConnection } from './utils/socket';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Board from './pages/Board';
import CreateBoard from './pages/CreateBoard';
import Login from './pages/Login';
import Register from './pages/Register';
import LoadingSpinner from './components/LoadingSpinner';
import CreateBoardModal from './components/CreateBoardModal';

// Styles
import './App.css';

function AppContent() {
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading, user } = useSelector((state) => state.auth);
  const { isCreateBoardModalOpen, sidebarCollapsed } = useSelector((state) => state.ui);

  useEffect(() => {
    // Check if user is authenticated on app load
    if (localStorage.getItem('token')) {
      dispatch(getCurrentUser());
    }
  }, [dispatch]);

  useEffect(() => {
    // Setup socket connection when user is authenticated
    if (isAuthenticated && user) {
      setupSocketConnection(dispatch);
    }
  }, [isAuthenticated, user, dispatch]);

  useEffect(() => {
    // Fetch boards when user is authenticated
    if (isAuthenticated) {
      dispatch(fetchBoards());
    }
  }, [isAuthenticated, dispatch]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
        <div className="kanban-board p-8">
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster position="top-right" />
      </Router>
    );
  }

  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <div className="main-layout">
          <Sidebar />
          <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/create-board" element={<CreateBoard />} />
              <Route path="/board/:boardId" element={<Board />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            },
          }}
        />
        
        {/* Modals */}
        {isCreateBoardModalOpen && <CreateBoardModal />}
      </div>
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
