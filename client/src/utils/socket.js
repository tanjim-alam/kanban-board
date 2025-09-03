import { io } from 'socket.io-client';
import { 
  updateTaskFromSocket, 
  addTaskFromSocket, 
  removeTaskFromSocket 
} from '../store/slices/tasksSlice';

let socket = null;

export const setupSocketConnection = (dispatch) => {
  if (socket) {
    socket.disconnect();
  }

  socket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:3001', {
    auth: {
      token: localStorage.getItem('token')
    }
  });

  socket.on('connect', () => {
    console.log('Connected to server');
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from server');
  });

  socket.on('task-updated', (data) => {
    dispatch(updateTaskFromSocket(data.task));
  });

  socket.on('task-created', (data) => {
    dispatch(addTaskFromSocket(data.task));
  });

  socket.on('task-deleted', (data) => {
    dispatch(removeTaskFromSocket(data));
  });

  return socket;
};

export const joinBoard = (boardId) => {
  if (socket) {
    socket.emit('join-board', boardId);
  }
};

export const leaveBoard = (boardId) => {
  if (socket) {
    socket.emit('leave-board', boardId);
  }
};

export const emitTaskUpdate = (data) => {
  if (socket) {
    socket.emit('task-updated', data);
  }
};

export const emitTaskCreate = (data) => {
  if (socket) {
    socket.emit('task-created', data);
  }
};

export const emitTaskDelete = (data) => {
  if (socket) {
    socket.emit('task-deleted', data);
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export { socket };

