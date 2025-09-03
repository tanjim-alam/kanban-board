import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Users, Lock, Globe, Palette, Settings } from 'lucide-react';
import { createBoard } from '../store/slices/boardsSlice';
import LoadingSpinner from '../components/LoadingSpinner';

const CreateBoard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.boards);
  
  const [isPublic, setIsPublic] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#3b82f6');

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const boardColors = [
    { name: 'Blue', value: '#3b82f6', bg: 'bg-blue-500' },
    { name: 'Purple', value: '#8b5cf6', bg: 'bg-purple-500' },
    { name: 'Green', value: '#10b981', bg: 'bg-green-500' },
    { name: 'Orange', value: '#f59e0b', bg: 'bg-orange-500' },
    { name: 'Red', value: '#ef4444', bg: 'bg-red-500' },
    { name: 'Pink', value: '#ec4899', bg: 'bg-pink-500' },
    { name: 'Indigo', value: '#6366f1', bg: 'bg-indigo-500' },
    { name: 'Teal', value: '#14b8a6', bg: 'bg-teal-500' },
  ];

  const handleGoBack = () => {
    navigate(-1);
  };

  const onSubmit = async (data) => {
    try {
      const boardData = {
        ...data,
        isPublic,
        color: selectedColor
      };

      const result = await dispatch(createBoard(boardData)).unwrap();
      toast.success('Board created successfully!');
      navigate(`/board/${result._id}`);
    } catch (error) {
      toast.error(error || 'Failed to create board');
    }
  };

  return (
    <div className="create-board-page">
      <div className="create-board-container">
        {/* Header */}
        <div className="create-board-header">
          <button
            onClick={handleGoBack}
            className="back-button"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className="create-board-title">Create New Board</h1>
          <p className="create-board-subtitle">
            Set up your new Kanban board and start organizing your tasks
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="create-board-form">
          <div className="form-sections">
            {/* Basic Information */}
            <div className="form-section">
              <div className="section-header">
                <Settings size={20} />
                <h3 className="section-title">Basic Information</h3>
              </div>
              
              <div className="form-fields">
                <div className="form-field">
                  <label className="form-label">
                    Board Title *
                  </label>
                  <input
                    {...register('title', { required: 'Board title is required' })}
                    type="text"
                    className="form-input"
                    placeholder="Enter board title"
                  />
                  {errors.title && (
                    <p className="form-error">{errors.title.message}</p>
                  )}
                </div>

                <div className="form-field">
                  <label className="form-label">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows={4}
                    className="form-textarea"
                    placeholder="Describe what this board is for (optional)"
                  />
                </div>
              </div>
            </div>

            {/* Board Color */}
            <div className="form-section">
              <div className="section-header">
                <Palette size={20} />
                <h3 className="section-title">Board Color</h3>
              </div>
              
              <div className="color-picker">
                <div className="color-grid">
                  {boardColors.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      className={`color-option ${selectedColor === color.value ? 'selected' : ''}`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setSelectedColor(color.value)}
                      title={color.name}
                    >
                      {selectedColor === color.value && (
                        <div className="color-check">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                              fill="white"
                            />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Visibility Settings */}
            <div className="form-section">
              <div className="section-header">
                <Users size={20} />
                <h3 className="section-title">Visibility</h3>
              </div>
              
              <div className="visibility-options">
                <div 
                  className={`visibility-option ${!isPublic ? 'selected' : ''}`}
                  onClick={() => setIsPublic(false)}
                >
                  <div className="visibility-icon">
                    <Lock size={20} />
                  </div>
                  <div className="visibility-content">
                    <h4 className="visibility-title">Private Board</h4>
                    <p className="visibility-description">
                      Only you and invited members can see this board
                    </p>
                  </div>
                  <div className="visibility-radio">
                    <input
                      type="radio"
                      checked={!isPublic}
                      onChange={() => setIsPublic(false)}
                    />
                  </div>
                </div>

                <div 
                  className={`visibility-option ${isPublic ? 'selected' : ''}`}
                  onClick={() => setIsPublic(true)}
                >
                  <div className="visibility-icon">
                    <Globe size={20} />
                  </div>
                  <div className="visibility-content">
                    <h4 className="visibility-title">Public Board</h4>
                    <p className="visibility-description">
                      Anyone with the link can view this board
                    </p>
                  </div>
                  <div className="visibility-radio">
                    <input
                      type="radio"
                      checked={isPublic}
                      onChange={() => setIsPublic(true)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={handleGoBack}
              className="action-button secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="action-button primary"
            >
              {isLoading && <LoadingSpinner size="small" />}
              Create Board
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBoard;

