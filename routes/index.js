// routes/index.js
import express from "express";
import usersRoutes from "./api/users.js";
import authRoutes from "./api/auth.js";
import resumesRoutes from "./api/resumes.js";
import aiRoutes from "./api/ai.js";
import jobsRoutes from "./api/jobs.js";
import applicationsRoutes from "./api/applications.js";
import matchingRoutes from "./api/matching.js";
import analyticsRoutes from "./api/analytics.js";
import adminRoutes from "./api/admin.js";

// Create a router for the API routes
const router = express.Router();

// Mount the individual route files to the main router
router.use("/users", usersRoutes);
router.use("/auth", authRoutes);
router.use("/resumes", resumesRoutes);
router.use("/ai", aiRoutes);
router.use("/jobs", jobsRoutes);
router.use("/applications", applicationsRoutes);
router.use("/matching", matchingRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/admin", adminRoutes);

export default router;
