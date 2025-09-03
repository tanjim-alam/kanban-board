import authReducer, { 
  loginUser, 
  registerUser, 
  logoutUser, 
  clearError 
} from '../slices/authSlice';

describe('authSlice', () => {
  const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };

  it('should return the initial state', () => {
    expect(authReducer(undefined, {})).toEqual(initialState);
  });

  it('should handle loginUser.pending', () => {
    const action = { type: loginUser.pending.type };
    const state = authReducer(initialState, action);
    expect(state.isLoading).toBe(true);
    expect(state.error).toBe(null);
  });

  it('should handle loginUser.fulfilled', () => {
    const mockUser = { id: '1', username: 'testuser', email: 'test@example.com' };
    const mockToken = 'mock-token';
    const action = {
      type: loginUser.fulfilled.type,
      payload: { user: mockUser, token: mockToken }
    };
    const state = authReducer(initialState, action);
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe(mockToken);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe(null);
  });

  it('should handle loginUser.rejected', () => {
    const errorMessage = 'Invalid credentials';
    const action = {
      type: loginUser.rejected.type,
      payload: errorMessage
    };
    const state = authReducer(initialState, action);
    expect(state.error).toBe(errorMessage);
    expect(state.isLoading).toBe(false);
    expect(state.isAuthenticated).toBe(false);
  });

  it('should handle logoutUser.fulfilled', () => {
    const stateWithUser = {
      ...initialState,
      user: { id: '1', username: 'testuser' },
      token: 'mock-token',
      isAuthenticated: true
    };
    const action = { type: logoutUser.fulfilled.type };
    const state = authReducer(stateWithUser, action);
    expect(state.user).toBe(null);
    expect(state.token).toBe(null);
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBe(null);
  });

  it('should handle clearError', () => {
    const stateWithError = {
      ...initialState,
      error: 'Some error'
    };
    const action = { type: clearError.type };
    const state = authReducer(stateWithError, action);
    expect(state.error).toBe(null);
  });
});

