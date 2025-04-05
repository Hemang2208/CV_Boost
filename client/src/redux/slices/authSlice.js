import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Load user from token
export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No token found');
      }

      // Set auth token in headers
      axios.defaults.headers.common['x-auth-token'] = token;

      const res = await axios.get('/api/auth');
      return res.data;
    } catch (err) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['x-auth-token'];
      return rejectWithValue(err.response?.data?.msg || 'Authentication failed');
    }
  }
);

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await axios.post('/api/auth', { email, password });
      
      // Store token in localStorage
      localStorage.setItem('token', res.data.token);
      
      // Set auth token in headers
      axios.defaults.headers.common['x-auth-token'] = res.data.token;
      
      // Load user data
      const userRes = await axios.get('/api/auth');
      return userRes.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.errors?.[0]?.msg || 'Login failed');
    }
  }
);

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const res = await axios.post('/api/users', { name, email, password });
      
      // Store token in localStorage
      localStorage.setItem('token', res.data.token);
      
      // Set auth token in headers
      axios.defaults.headers.common['x-auth-token'] = res.data.token;
      
      // Load user data
      const userRes = await axios.get('/api/auth');
      return userRes.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.errors?.[0]?.msg || 'Registration failed');
    }
  }
);

// Admin login
export const adminLogin = createAsyncThunk(
  'auth/adminLogin',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await axios.post('/api/admin/login', { email, password });
      
      // Store token in localStorage
      localStorage.setItem('adminToken', res.data.token);
      
      // Set auth token in headers
      axios.defaults.headers.common['x-auth-token'] = res.data.token;
      
      return { isAdmin: true, email };
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg || 'Admin login failed');
    }
  }
);

const initialState = {
  token: localStorage.getItem('token'),
  adminToken: localStorage.getItem('adminToken'),
  isAuthenticated: false,
  isAdmin: false,
  user: null,
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['x-auth-token'];
      state.token = null;
      state.isAuthenticated = false;
      state.user = null;
      state.loading = false;
      state.error = null;
    },
    adminLogout: (state) => {
      localStorage.removeItem('adminToken');
      delete axios.defaults.headers.common['x-auth-token'];
      state.adminToken = null;
      state.isAdmin = false;
      state.loading = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Load user
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.token = null;
        state.isAuthenticated = false;
        state.user = null;
        state.loading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.token = null;
        state.isAuthenticated = false;
        state.user = null;
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.token = null;
        state.isAuthenticated = false;
        state.user = null;
        state.loading = false;
        state.error = action.payload;
      })
      // Admin login
      .addCase(adminLogin.pending, (state) => {
        state.loading = true;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.isAdmin = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.adminToken = null;
        state.isAdmin = false;
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { logout, adminLogout, clearError } = authSlice.actions;

export default authSlice.reducer;