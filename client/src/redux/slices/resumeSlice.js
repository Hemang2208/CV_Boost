import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Get all resumes for the authenticated user
export const getResumes = createAsyncThunk(
  'resume/getResumes',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/api/resumes');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg || 'Failed to fetch resumes');
    }
  }
);

// Get a specific resume by ID
export const getResumeById = createAsyncThunk(
  'resume/getResumeById',
  async (resumeId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/resumes/${resumeId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg || 'Failed to fetch resume');
    }
  }
);

// Create a new resume
export const createResume = createAsyncThunk(
  'resume/createResume',
  async (resumeData, { rejectWithValue }) => {
    try {
      const res = await axios.post('/api/resumes', resumeData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg || 'Failed to create resume');
    }
  }
);

// Update an existing resume
export const updateResume = createAsyncThunk(
  'resume/updateResume',
  async ({ resumeId, resumeData }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/resumes/${resumeId}`, resumeData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg || 'Failed to update resume');
    }
  }
);

// Delete a resume
export const deleteResume = createAsyncThunk(
  'resume/deleteResume',
  async (resumeId, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/resumes/${resumeId}`);
      return resumeId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg || 'Failed to delete resume');
    }
  }
);

// Optimize resume experience with AI
export const optimizeExperience = createAsyncThunk(
  'resume/optimizeExperience',
  async ({ experienceText, jobTitle, jobDescription }, { rejectWithValue }) => {
    try {
      const res = await axios.post('/api/ai/optimize-experience', {
        experienceText,
        jobTitle,
        jobDescription
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg || 'Failed to optimize experience');
    }
  }
);

// Get skill suggestions based on job title
export const getSuggestedSkills = createAsyncThunk(
  'resume/getSuggestedSkills',
  async ({ jobTitle, resumeContent }, { rejectWithValue }) => {
    try {
      const res = await axios.post('/api/ai/suggest-skills', {
        jobTitle,
        resumeContent
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg || 'Failed to get skill suggestions');
    }
  }
);

const initialState = {
  resumes: [],
  currentResume: null,
  optimizedText: '',
  suggestedSkills: [],
  loading: false,
  error: null
};

const resumeSlice = createSlice({
  name: 'resume',
  initialState,
  reducers: {
    clearCurrentResume: (state) => {
      state.currentResume = null;
    },
    clearOptimizedText: (state) => {
      state.optimizedText = '';
    },
    clearSuggestedSkills: (state) => {
      state.suggestedSkills = [];
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all resumes
      .addCase(getResumes.pending, (state) => {
        state.loading = true;
      })
      .addCase(getResumes.fulfilled, (state, action) => {
        state.resumes = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getResumes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get resume by ID
      .addCase(getResumeById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getResumeById.fulfilled, (state, action) => {
        state.currentResume = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(getResumeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create resume
      .addCase(createResume.pending, (state) => {
        state.loading = true;
      })
      .addCase(createResume.fulfilled, (state, action) => {
        state.resumes.push(action.payload);
        state.currentResume = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(createResume.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update resume
      .addCase(updateResume.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateResume.fulfilled, (state, action) => {
        state.resumes = state.resumes.map(resume =>
          resume._id === action.payload._id ? action.payload : resume
        );
        state.currentResume = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(updateResume.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete resume
      .addCase(deleteResume.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteResume.fulfilled, (state, action) => {
        state.resumes = state.resumes.filter(resume => resume._id !== action.payload);
        if (state.currentResume && state.currentResume._id === action.payload) {
          state.currentResume = null;
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteResume.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Optimize experience
      .addCase(optimizeExperience.pending, (state) => {
        state.loading = true;
      })
      .addCase(optimizeExperience.fulfilled, (state, action) => {
        state.optimizedText = action.payload.optimizedText;
        state.loading = false;
        state.error = null;
      })
      .addCase(optimizeExperience.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get suggested skills
      .addCase(getSuggestedSkills.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSuggestedSkills.fulfilled, (state, action) => {
        state.suggestedSkills = action.payload.skills;
        state.loading = false;
        state.error = null;
      })
      .addCase(getSuggestedSkills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearCurrentResume,
  clearOptimizedText,
  clearSuggestedSkills,
  clearError
} = resumeSlice.actions;

export default resumeSlice.reducer;