import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import resumeReducer from "./slices/resumeSlice";
import applicationReducer from "./slices/applicationSlice";
import uiReducer from "./slices/uiSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    resume: resumeReducer,
    application: applicationReducer,
    ui: uiReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export default store;
