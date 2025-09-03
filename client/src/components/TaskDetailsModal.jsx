import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { 
  X, 
  Calendar, 
  User, 
  Tag, 
  Clock, 
  MessageCircle, 
  Edit3,
  Trash2,
  Save,
  X as XIcon
} from 'lucide-react';
import { closeTaskDetailsModal } from '../store/slices/uiSlice';
import { updateTask, deleteTask, addComment } from '../store/slices/tasksSlice';
import { fetchUsers } from '../store/slices/usersSlice';
import LoadingSpinner from './LoadingSpinner';

const TaskDetailsModal = ({ taskId }) => {
  const dispatch = useDispatch();
  const { currentTask, isLoading } = useSelector((state) => state.tasks);
  const { users } = useSelector((state) => state.users);
  
  const [isEditing, setIsEditing] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [selectedAssignees, setSelectedAssignees] = useState([]);
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();

  // Fetch users when modal opens
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Update form when task changes
  useEffect(() => {
    if (currentTask) {
      setValue('title', currentTask.title);
      setValue('description', currentTask.description);
      setValue('priority', currentTask.priority);
      setValue('dueDate', currentTask.dueDate ? format(new Date(currentTask.dueDate), 'yyyy-MM-dd') : '');
      setValue('estimatedHours', currentTask.estimatedHours);
      setSelectedAssignees(currentTask.assignees?.map(a => a._id) || []);
      setTags(currentTask.tags || []);
    }
  }, [currentTask, setValue]);

  const handleClose = () => {
    dispatch(closeTaskDetailsModal());
    setIsEditing(false);
    setNewComment('');
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (currentTask) {
      setValue('title', currentTask.title);
      setValue('description', currentTask.description);
      setValue('priority', currentTask.priority);
      setValue('dueDate', currentTask.dueDate ? format(new Date(currentTask.dueDate), 'yyyy-MM-dd') : '');
      setValue('estimatedHours', currentTask.estimatedHours);
      setSelectedAssignees(currentTask.assignees?.map(a => a._id) || []);
      setTags(currentTask.tags || []);
    }
  };

  const handleSave = async (data) => {
    try {
      const updateData = {
        ...data,
        assignees: selectedAssignees,
        tags,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
        estimatedHours: data.estimatedHours ? parseInt(data.estimatedHours) : 0
      };

      await dispatch(updateTask({ taskId, taskData: updateData })).unwrap();
      toast.success('Task updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error(error || 'Failed to update task');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await dispatch(deleteTask(taskId)).unwrap();
        toast.success('Task deleted successfully');
        handleClose();
      } catch (error) {
        toast.error(error || 'Failed to delete task');
      }
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await dispatch(addComment({ taskId, content: newComment.trim() })).unwrap();
      setNewComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      toast.error(error || 'Failed to add comment');
    }
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!currentTask) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Task Details</h2>
          <button
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {isEditing ? (
            <form onSubmit={handleSubmit(handleSave)} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  {...register('title', { required: 'Title is required' })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  {...register('priority')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              {/* Assignees */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignees
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
                  {users.map((user) => (
                    <label key={user._id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedAssignees.includes(user._id)}
                        onChange={() => handleAssigneeToggle(user._id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </div>
                        <span className="text-sm text-gray-700">
                          {user.fullName || `${user.firstName} ${user.lastName}`}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add a tag"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Add
                  </button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <XIcon size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  {...register('dueDate')}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Estimated Hours */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Hours
                </label>
                <input
                  {...register('estimatedHours')}
                  type="number"
                  min="0"
                  step="0.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading && <LoadingSpinner size="small" />}
                  <Save size={16} />
                  Save
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                    {currentTask.title}
                  </h3>
                  {currentTask.description && (
                    <p className="text-gray-600 whitespace-pre-wrap">
                      {currentTask.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleEdit}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                    title="Edit task"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Delete task"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Task Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <span
                    className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${getPriorityColor(currentTask.priority)}`}
                  >
                    {currentTask.priority}
                  </span>
                </div>

                {/* Due Date */}
                {currentTask.dueDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Date
                    </label>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={16} />
                      {format(new Date(currentTask.dueDate), 'MMM dd, yyyy')}
                    </div>
                  </div>
                )}

                {/* Estimated Hours */}
                {currentTask.estimatedHours > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Hours
                    </label>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock size={16} />
                      {currentTask.estimatedHours} hours
                    </div>
                  </div>
                )}

                {/* Assignees */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assignees
                  </label>
                  {currentTask.assignees && currentTask.assignees.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {currentTask.assignees.map((assignee) => (
                        <div
                          key={assignee._id}
                          className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                            {assignee.firstName?.[0]}{assignee.lastName?.[0]}
                          </div>
                          {assignee.fullName || `${assignee.firstName} ${assignee.lastName}`}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">No assignees</span>
                  )}
                </div>
              </div>

              {/* Tags */}
              {currentTask.tags && currentTask.tags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {currentTask.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        <Tag size={12} />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments
                </label>
                
                {/* Add Comment */}
                <div className="mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddComment())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Add a comment..."
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Comments List */}
                {currentTask.comments && currentTask.comments.length > 0 ? (
                  <div className="space-y-3">
                    {currentTask.comments.map((comment, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                            {comment.user.firstName?.[0]}{comment.user.lastName?.[0]}
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {comment.user.fullName || `${comment.user.firstName} ${comment.user.lastName}`}
                          </span>
                          <span className="text-xs text-gray-500">
                            {format(new Date(comment.createdAt), 'MMM dd, yyyy HH:mm')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No comments yet</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal;

