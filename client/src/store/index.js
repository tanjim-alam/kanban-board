import { configureStore } from '@reduxjs/toolkit';
import boardsReducer from './slices/boardsSlice';
import tasksReducer from './slices/tasksSlice';
import usersReducer from './slices/usersSlice';
import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    boards: boardsReducer,
    tasks: tasksReducer,
    users: usersReducer,
    ui: uiReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});
