import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Get all applications for the authenticated user
export const getApplications = createAsyncThunk(
  'application/getApplications',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/api/applications');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg || 'Failed to fetch applications');
    }
  }
);

// Get a specific application by ID
export const getApplicationById = createAsyncThunk(
  'application/getApplicationById',
  async (applicationId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/applications/${applicationId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg || 'Failed to fetch application');
    }
  }
);

// Create a new application
export const createApplication = createAsyncThunk(
  'application/createApplication',
  async (applicationData, { rejectWithValue }) => {
    try {
      const res = await axios.post('/api/applications', applicationData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg || 'Failed to create application');
    }
  }
);

// Update an existing application
export const updateApplication = createAsyncThunk(
  'application/updateApplication',
  async ({ applicationId, applicationData }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/applications/${applicationId}`, applicationData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg || 'Failed to update application');
    }
  }
);

// Delete an application
export const deleteApplication = createAsyncThunk(
  'application/deleteApplication',
  async (applicationId, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/applications/${applicationId}`);
      return applicationId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg || 'Failed to delete application');
    }
  }
);

// Match resume to jobs
export const matchResumeToJobs = createAsyncThunk(
  'application/matchResumeToJobs',
  async (resumeId, { rejectWithValue }) => {
    try {
      const res = await axios.post('/api/matching/resume-to-jobs', { resumeId });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg || 'Failed to match resume to jobs');
    }
  }
);

const initialState = {
  applications: [],
  currentApplication: null,
  matchedJobs: [],
  loading: false,
  error: null
};

const applicationSlice = createSlice({
  name: 'application',
  initialState,
  reducers: {
    clearCurrentApplication: (state) => {
      state.currentApplication = null;
    },
    clearMatchedJobs: (state) => {
      state.matchedJobs = [];
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all applications
      .addCase(getApplications.pending, (state) => {
        state.loading = true;
      })
      .addCase(getApplications.fulfilled, (state, action) => {
        state.applications = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get application by ID
      .addCase(getApplicationById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getApplicationById.fulfilled, (state, action) => {
        state.currentApplication = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getApplicationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create application
      .addCase(createApplication.pending, (state) => {
        state.loading = true;
      })
      .addCase(createApplication.fulfilled, (state, action) => {
        state.applications.push(action.payload);
        state.currentApplication = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(createApplication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update application
      .addCase(updateApplication.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateApplication.fulfilled, (state, action) => {
        state.applications = state.applications.map(application =>
          application._id === action.payload._id ? action.payload : application
        );
        state.currentApplication = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(updateApplication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete application
      .addCase(deleteApplication.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteApplication.fulfilled, (state, action) => {
        state.applications = state.applications.filter(application => application._id !== action.payload);
        if (state.currentApplication && state.currentApplication._id === action.payload) {
          state.currentApplication = null;
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteApplication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Match resume to jobs
      .addCase(matchResumeToJobs.pending, (state) => {
        state.loading = true;
      })
      .addCase(matchResumeToJobs.fulfilled, (state, action) => {
        state.matchedJobs = action.payload.matchedJobs;
        state.loading = false;
        state.error = null;
      })
      .addCase(matchResumeToJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearCurrentApplication,
  clearMatchedJobs,
  clearError
} = applicationSlice.actions;

export default applicationSlice.reducer;