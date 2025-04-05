import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import bcrypt from "bcryptjs";
import connectDB from "./config/db.js";
import routes from "./routes/index.js";
import User from "./models/User.js";

// Load environment variables
dotenv.config();

// Initialize the express app
const app = express();

// Connect to the database
connectDB();

// Initialize admin user
const initializeAdmin = async () => {
  try {
    // Check if admin credentials are defined in environment variables
    if (!process.env.ADMIN_ID || !process.env.ADMIN_PASSWORD) {
      console.error('Admin credentials not properly defined in environment variables');
      return;
    }

    const adminUser = await User.findOne({ email: process.env.ADMIN_ID });
    if (!adminUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, salt);

      await User.create({
        name: 'Admin',
        email: process.env.ADMIN_ID,
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
  } catch (err) {
    console.error('Error initializing admin user:', err.message);
  }
};

initializeAdmin();

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Define routes
app.use("/api", routes);

// Root route handler
app.get("/", (req, res) => {
  res.send("Welcome to the AI Resume Builder API");
});

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.resolve("client", "build")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve("client", "build", "index.html"));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ msg: "Something went wrong!" });
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
