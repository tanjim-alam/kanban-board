import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (boardId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/tasks/board/${boardId}`);
      return { boardId, tasks: response.data.tasks };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tasks');
    }
  }
);

export const fetchTask = createAsyncThunk(
  'tasks/fetchTask',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/tasks/${taskId}`);
      return response.data.task;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch task');
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/tasks', taskData);
      return response.data.task;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create task');
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ taskId, taskData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/tasks/${taskId}`, taskData);
      return response.data.task;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update task');
    }
  }
);

export const moveTask = createAsyncThunk(
  'tasks/moveTask',
  async ({ taskId, columnId, position }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/tasks/${taskId}/move`, {
        columnId,
        position
      });
      return response.data.task;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to move task');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/tasks/${taskId}`);
      return taskId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete task');
    }
  }
);

export const addComment = createAsyncThunk(
  'tasks/addComment',
  async ({ taskId, content }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/tasks/${taskId}/comments`, { content });
      return response.data.task;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add comment');
    }
  }
);

const initialState = {
  tasks: {},
  currentTask: null,
  isLoading: false,
  error: null,
  optimisticUpdates: {},
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },
    // Optimistic updates for drag and drop
    moveTaskOptimistically: (state, action) => {
      const { taskId, sourceColumnId, destinationColumnId, sourceIndex, destinationIndex } = action.payload;
      
      // Store original state for rollback
      if (!state.optimisticUpdates[taskId]) {
        const task = Object.values(state.tasks).flat().find(t => t._id === taskId);
        if (task) {
          state.optimisticUpdates[taskId] = {
            columnId: task.columnId,
            position: task.position
          };
        }
      }
      
      // Update task position optimistically
      Object.values(state.tasks).flat().forEach(task => {
        if (task._id === taskId) {
          task.columnId = destinationColumnId;
          task.position = destinationIndex;
        }
      });
    },
    revertTaskMove: (state, action) => {
      const { taskId } = action.payload;
      const originalState = state.optimisticUpdates[taskId];
      
      if (originalState) {
        Object.values(state.tasks).flat().forEach(task => {
          if (task._id === taskId) {
            task.columnId = originalState.columnId;
            task.position = originalState.position;
          }
        });
        delete state.optimisticUpdates[taskId];
      }
    },
    clearOptimisticUpdate: (state, action) => {
      const { taskId } = action.payload;
      delete state.optimisticUpdates[taskId];
    },
    // Real-time updates
    updateTaskFromSocket: (state, action) => {
      const updatedTask = action.payload;
      const boardId = updatedTask.boardId;
      
      if (state.tasks[boardId]) {
        const taskIndex = state.tasks[boardId].findIndex(t => t._id === updatedTask._id);
        if (taskIndex !== -1) {
          state.tasks[boardId][taskIndex] = updatedTask;
        } else {
          state.tasks[boardId].push(updatedTask);
        }
      }
      
      if (state.currentTask && state.currentTask._id === updatedTask._id) {
        state.currentTask = updatedTask;
      }
    },
    addTaskFromSocket: (state, action) => {
      const newTask = action.payload;
      const boardId = newTask.boardId;
      
      if (state.tasks[boardId]) {
        state.tasks[boardId].push(newTask);
      } else {
        state.tasks[boardId] = [newTask];
      }
    },
    removeTaskFromSocket: (state, action) => {
      const { taskId, boardId } = action.payload;
      
      if (state.tasks[boardId]) {
        state.tasks[boardId] = state.tasks[boardId].filter(t => t._id !== taskId);
      }
      
      if (state.currentTask && state.currentTask._id === taskId) {
        state.currentTask = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tasks
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        const { boardId, tasks } = action.payload;
        state.tasks[boardId] = tasks;
        state.error = null;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch task
      .addCase(fetchTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTask = action.payload;
        state.error = null;
      })
      .addCase(fetchTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create task
      .addCase(createTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.isLoading = false;
        const task = action.payload;
        const boardId = task.boardId;
        
        if (state.tasks[boardId]) {
          state.tasks[boardId].push(task);
        } else {
          state.tasks[boardId] = [task];
        }
        state.error = null;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update task
      .addCase(updateTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedTask = action.payload;
        const boardId = updatedTask.boardId;
        
        if (state.tasks[boardId]) {
          const taskIndex = state.tasks[boardId].findIndex(t => t._id === updatedTask._id);
          if (taskIndex !== -1) {
            state.tasks[boardId][taskIndex] = updatedTask;
          }
        }
        
        if (state.currentTask && state.currentTask._id === updatedTask._id) {
          state.currentTask = updatedTask;
        }
        state.error = null;
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Move task
      .addCase(moveTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(moveTask.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedTask = action.payload;
        const boardId = updatedTask.boardId;
        
        if (state.tasks[boardId]) {
          const taskIndex = state.tasks[boardId].findIndex(t => t._id === updatedTask._id);
          if (taskIndex !== -1) {
            state.tasks[boardId][taskIndex] = updatedTask;
          }
        }
        
        // Clear optimistic update
        delete state.optimisticUpdates[updatedTask._id];
        state.error = null;
      })
      .addCase(moveTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete task
      .addCase(deleteTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.isLoading = false;
        const taskId = action.payload;
        
        // Remove from all boards
        Object.keys(state.tasks).forEach(boardId => {
          state.tasks[boardId] = state.tasks[boardId].filter(t => t._id !== taskId);
        });
        
        if (state.currentTask && state.currentTask._id === taskId) {
          state.currentTask = null;
        }
        state.error = null;
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add comment
      .addCase(addComment.fulfilled, (state, action) => {
        const updatedTask = action.payload;
        const boardId = updatedTask.boardId;
        
        if (state.tasks[boardId]) {
          const taskIndex = state.tasks[boardId].findIndex(t => t._id === updatedTask._id);
          if (taskIndex !== -1) {
            state.tasks[boardId][taskIndex] = updatedTask;
          }
        }
        
        if (state.currentTask && state.currentTask._id === updatedTask._id) {
          state.currentTask = updatedTask;
        }
      });
  },
});

export const {
  clearError,
  clearCurrentTask,
  moveTaskOptimistically,
  revertTaskMove,
  clearOptimisticUpdate,
  updateTaskFromSocket,
  addTaskFromSocket,
  removeTaskFromSocket,
} = tasksSlice.actions;
export default tasksSlice.reducer;

