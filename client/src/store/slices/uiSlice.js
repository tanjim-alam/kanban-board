import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Modal states
  isCreateBoardModalOpen: false,
  isCreateTaskModalOpen: false,
  isEditTaskModalOpen: false,
  isTaskDetailsModalOpen: false,
  isAddMemberModalOpen: false,
  
  // Task details
  selectedTaskId: null,
  
  // Filters and search
  searchTerm: '',
  filterByAssignee: null,
  filterByPriority: null,
  filterByStatus: null,
  filterByTags: [],
  
  // UI preferences
  sidebarCollapsed: false,
  theme: 'light',
  
  // Loading states
  isDragging: false,
  dragSource: null,
  dragDestination: null,
  
  // Notifications
  notifications: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Modal actions
    openCreateBoardModal: (state) => {
      state.isCreateBoardModalOpen = true;
    },
    closeCreateBoardModal: (state) => {
      state.isCreateBoardModalOpen = false;
    },
    openCreateTaskModal: (state) => {
      state.isCreateTaskModalOpen = true;
    },
    closeCreateTaskModal: (state) => {
      state.isCreateTaskModalOpen = false;
    },
    openEditTaskModal: (state, action) => {
      state.isEditTaskModalOpen = true;
      state.selectedTaskId = action.payload;
    },
    closeEditTaskModal: (state) => {
      state.isEditTaskModalOpen = false;
      state.selectedTaskId = null;
    },
    openTaskDetailsModal: (state, action) => {
      state.isTaskDetailsModalOpen = true;
      state.selectedTaskId = action.payload;
    },
    closeTaskDetailsModal: (state) => {
      state.isTaskDetailsModalOpen = false;
      state.selectedTaskId = null;
    },
    openAddMemberModal: (state) => {
      state.isAddMemberModalOpen = true;
    },
    closeAddMemberModal: (state) => {
      state.isAddMemberModalOpen = false;
    },
    
    // Filter and search actions
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setFilterByAssignee: (state, action) => {
      state.filterByAssignee = action.payload;
    },
    setFilterByPriority: (state, action) => {
      state.filterByPriority = action.payload;
    },
    setFilterByStatus: (state, action) => {
      state.filterByStatus = action.payload;
    },
    setFilterByTags: (state, action) => {
      state.filterByTags = action.payload;
    },
    clearFilters: (state) => {
      state.searchTerm = '';
      state.filterByAssignee = null;
      state.filterByPriority = null;
      state.filterByStatus = null;
      state.filterByTags = [];
    },
    
    // UI preferences
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    
    // Drag and drop states
    setDragging: (state, action) => {
      state.isDragging = action.payload;
    },
    setDragSource: (state, action) => {
      state.dragSource = action.payload;
    },
    setDragDestination: (state, action) => {
      state.dragDestination = action.payload;
    },
    clearDragState: (state) => {
      state.isDragging = false;
      state.dragSource = null;
      state.dragDestination = null;
    },
    
    // Notifications
    addNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...action.payload
      };
      state.notifications.unshift(notification);
      
      // Keep only last 10 notifications
      if (state.notifications.length > 10) {
        state.notifications = state.notifications.slice(0, 10);
      }
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    
    // Reset UI state
    resetUI: (state) => {
      return { ...initialState, theme: state.theme };
    },
  },
});

export const {
  // Modal actions
  openCreateBoardModal,
  closeCreateBoardModal,
  openCreateTaskModal,
  closeCreateTaskModal,
  openEditTaskModal,
  closeEditTaskModal,
  openTaskDetailsModal,
  closeTaskDetailsModal,
  openAddMemberModal,
  closeAddMemberModal,
  
  // Filter and search actions
  setSearchTerm,
  setFilterByAssignee,
  setFilterByPriority,
  setFilterByStatus,
  setFilterByTags,
  clearFilters,
  
  // UI preferences
  toggleSidebar,
  setSidebarCollapsed,
  setTheme,
  
  // Drag and drop states
  setDragging,
  setDragSource,
  setDragDestination,
  clearDragState,
  
  // Notifications
  addNotification,
  removeNotification,
  clearNotifications,
  
  // Reset UI state
  resetUI,
} = uiSlice.actions;

export default uiSlice.reducer;

