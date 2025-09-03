import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { X, Calendar, User, Tag, Clock } from 'lucide-react';
import { closeCreateTaskModal } from '../store/slices/uiSlice';
import { createTask } from '../store/slices/tasksSlice';
import { fetchUsers } from '../store/slices/usersSlice';
import LoadingSpinner from './LoadingSpinner';

const CreateTaskModal = ({ boardId }) => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.tasks);
  const { users } = useSelector((state) => state.users);
  
  const [selectedAssignees, setSelectedAssignees] = useState([]);
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  // Fetch users when modal opens
  React.useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleClose = () => {
    dispatch(closeCreateTaskModal());
    reset();
    setSelectedAssignees([]);
    setTags([]);
    setNewTag('');
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAssigneeToggle = (userId) => {
    setSelectedAssignees(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const onSubmit = async (data) => {
    try {
      const taskData = {
        ...data,
        boardId,
        columnId: 'todo', // Default to first column
        assignees: selectedAssignees,
        tags,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
        estimatedHours: data.estimatedHours ? parseInt(data.estimatedHours) : 0
      };

      await dispatch(createTask(taskData)).unwrap();
      toast.success('Task created successfully');
      handleClose();
    } catch (error) {
      toast.error(error || 'Failed to create task');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Create New Task</h2>
          <button
            onClick={handleClose}
            className="modal-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="modal-form">
          <div className="modal-body">
            {/* Task Title */}
            <div className="modal-form-field">
              <label className="modal-form-label">
                Title *
              </label>
              <input
                {...register('title', { required: 'Title is required' })}
                type="text"
                className="modal-form-input"
                placeholder="Enter task title"
              />
              {errors.title && (
                <p className="modal-form-error">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="modal-form-field">
              <label className="modal-form-label">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="modal-form-textarea"
                placeholder="Enter task description"
              />
            </div>

            {/* Priority */}
            <div className="modal-form-field">
              <label className="modal-form-label">
                Priority
              </label>
              <select
                {...register('priority')}
                className="modal-form-select"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Assignees */}
            <div className="modal-form-field">
              <label className="modal-form-label">
                Assignees
              </label>
              <div className="assignee-list">
                {users.map((user) => (
                  <div 
                    key={user._id} 
                    className={`assignee-item ${selectedAssignees.includes(user._id) ? 'selected' : ''}`}
                    onClick={() => handleAssigneeToggle(user._id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedAssignees.includes(user._id)}
                      onChange={() => handleAssigneeToggle(user._id)}
                      className="assignee-checkbox"
                    />
                    <div className="assignee-info">
                      <div className="assignee-avatar-small">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </div>
                      <span className="assignee-name">
                        {user.fullName || `${user.firstName} ${user.lastName}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="modal-form-field">
              <label className="modal-form-label">
                Tags
              </label>
              <div className="tag-input-container">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="tag-input"
                  placeholder="Add a tag"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="modal-button secondary"
                >
                  Add
                </button>
              </div>
              {tags.length > 0 && (
                <div className="tag-list">
                  {tags.map((tag, index) => (
                    <span key={index} className="tag-item">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="tag-remove"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Due Date */}
            <div className="modal-form-field">
              <label className="modal-form-label">
                Due Date
              </label>
              <input
                {...register('dueDate')}
                type="date"
                className="modal-form-input"
              />
            </div>

            {/* Estimated Hours */}
            <div className="modal-form-field">
              <label className="modal-form-label">
                Estimated Hours
              </label>
              <input
                {...register('estimatedHours')}
                type="number"
                min="0"
                step="0.5"
                className="modal-form-input"
                placeholder="0"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="modal-footer">
            <button
              type="button"
              onClick={handleClose}
              className="modal-button secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="modal-button primary"
            >
              {isLoading && <LoadingSpinner size="small" />}
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
