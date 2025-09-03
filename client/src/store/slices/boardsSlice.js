import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunks
export const fetchBoards = createAsyncThunk(
  'boards/fetchBoards',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/boards');
      return response.data.boards;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch boards');
    }
  }
);

export const fetchBoard = createAsyncThunk(
  'boards/fetchBoard',
  async (boardId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/boards/${boardId}`);
      return response.data.board;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch board');
    }
  }
);

export const createBoard = createAsyncThunk(
  'boards/createBoard',
  async (boardData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/boards', boardData);
      return response.data.board;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create board');
    }
  }
);

export const updateBoard = createAsyncThunk(
  'boards/updateBoard',
  async ({ boardId, boardData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/boards/${boardId}`, boardData);
      return response.data.board;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update board');
    }
  }
);

export const deleteBoard = createAsyncThunk(
  'boards/deleteBoard',
  async (boardId, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/boards/${boardId}`);
      return boardId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete board');
    }
  }
);

export const addBoardMember = createAsyncThunk(
  'boards/addBoardMember',
  async ({ boardId, userId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/boards/${boardId}/members`, { userId });
      return response.data.board;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add member');
    }
  }
);

export const removeBoardMember = createAsyncThunk(
  'boards/removeBoardMember',
  async ({ boardId, userId }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/api/boards/${boardId}/members/${userId}`);
      return response.data.board;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove member');
    }
  }
);

const initialState = {
  boards: [],
  currentBoard: null,
  isLoading: false,
  error: null,
};

const boardsSlice = createSlice({
  name: 'boards',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentBoard: (state) => {
      state.currentBoard = null;
    },
    updateBoardOptimistically: (state, action) => {
      const { boardId, updates } = action.payload;
      const board = state.boards.find(b => b._id === boardId);
      if (board) {
        Object.assign(board, updates);
      }
      if (state.currentBoard && state.currentBoard._id === boardId) {
        Object.assign(state.currentBoard, updates);
      }
    },
    revertBoardUpdate: (state, action) => {
      const { boardId, originalData } = action.payload;
      const board = state.boards.find(b => b._id === boardId);
      if (board) {
        Object.assign(board, originalData);
      }
      if (state.currentBoard && state.currentBoard._id === boardId) {
        Object.assign(state.currentBoard, originalData);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch boards
      .addCase(fetchBoards.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBoards.fulfilled, (state, action) => {
        state.isLoading = false;
        state.boards = action.payload;
        state.error = null;
      })
      .addCase(fetchBoards.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch board
      .addCase(fetchBoard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBoard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBoard = action.payload;
        state.error = null;
      })
      .addCase(fetchBoard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create board
      .addCase(createBoard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBoard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.boards.unshift(action.payload);
        state.error = null;
      })
      .addCase(createBoard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update board
      .addCase(updateBoard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBoard.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.boards.findIndex(b => b._id === action.payload._id);
        if (index !== -1) {
          state.boards[index] = action.payload;
        }
        if (state.currentBoard && state.currentBoard._id === action.payload._id) {
          state.currentBoard = action.payload;
        }
        state.error = null;
      })
      .addCase(updateBoard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete board
      .addCase(deleteBoard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteBoard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.boards = state.boards.filter(b => b._id !== action.payload);
        if (state.currentBoard && state.currentBoard._id === action.payload) {
          state.currentBoard = null;
        }
        state.error = null;
      })
      .addCase(deleteBoard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add board member
      .addCase(addBoardMember.fulfilled, (state, action) => {
        const index = state.boards.findIndex(b => b._id === action.payload._id);
        if (index !== -1) {
          state.boards[index] = action.payload;
        }
        if (state.currentBoard && state.currentBoard._id === action.payload._id) {
          state.currentBoard = action.payload;
        }
      })
      // Remove board member
      .addCase(removeBoardMember.fulfilled, (state, action) => {
        const index = state.boards.findIndex(b => b._id === action.payload._id);
        if (index !== -1) {
          state.boards[index] = action.payload;
        }
        if (state.currentBoard && state.currentBoard._id === action.payload._id) {
          state.currentBoard = action.payload;
        }
      });
  },
});

export const { 
  clearError, 
  clearCurrentBoard, 
  updateBoardOptimistically, 
  revertBoardUpdate 
} = boardsSlice.actions;
export default boardsSlice.reducer;

