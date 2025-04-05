import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: {},
  notifications: [],
  theme: localStorage.getItem('theme') || 'light',
  sidebarOpen: false
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      const { key, isLoading } = action.payload;
      state.loading[key] = isLoading;
    },
    addNotification: (state, action) => {
      const { id = Date.now(), type, message, duration = 5000 } = action.payload;
      state.notifications.push({ id, type, message, duration });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.theme);
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    }
  }
});

export const { 
  setLoading, 
  addNotification, 
  removeNotification, 
  toggleTheme,
  toggleSidebar,
  setSidebarOpen
} = uiSlice.actions;

// Selectors
export const selectLoading = (state, key) => state.ui.loading[key] || false;
export const selectNotifications = state => state.ui.notifications;
export const selectTheme = state => state.ui.theme;
export const selectSidebarOpen = state => state.ui.sidebarOpen;

export default uiSlice.reducer;