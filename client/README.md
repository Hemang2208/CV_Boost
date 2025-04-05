# AI-Powered Resume Builder

A full-stack application that leverages AI to help job seekers create optimized resumes. Key features include:

- AI-generated content suggestions using OpenAI/Gemini
- Resume scoring system based on job descriptions
- Application tracking with analytics dashboard
- Multi-template support with real-time preview
- Collaborative editing capabilities
- PDF export functionality

## Features

- **Multiple Resume Templates**: Choose from various professional resume templates
- **AI-Powered Content Optimization**: Enhance work experience descriptions with AI suggestions
- **ATS-Friendly Formatting**: Ensure your resume passes Applicant Tracking Systems
- **Industry-Specific Skill Suggestions**: Get relevant skill recommendations based on job titles
- **Job Matching**: Find jobs that match your resume and get optimization suggestions
- **Application Tracking**: Track your job applications and their statuses
- **Analytics Dashboard**: View insights about your job search and application performance
- **Real-time Resume Editing**: Edit your resume with instant preview
- **PDF Export**: Download your resume as a professional PDF document

## Technology Stack

**Frontend**
- React 19 + Vite
- React Router v6
- Chart.js for analytics
- Tailwind CSS + DaisyUI

**Backend**
- Node.js 20
- Express 4
- MongoDB 7
- Mongoose 8

**AI Services**
- OpenAI GPT-4
- Google Gemini Pro

**Authentication**
- JWT-based auth
- bcrypt password hashing
- Role-based access control

## Prerequisites

- Node.js v18+
- MongoDB Atlas account
- OpenAI API key
- Google Gemini API key
- Git

## Installation & Setup

1. Clone repository:
```bash
git clone https://github.com/yourusername/ai-resume-builder.git
cd ai-resume-builder
```

2. Install dependencies:
```bash
npm install
cd client
npm install
cd ..
```

3. Create `.env` file:
```env
MONGO_URI=your_mongodb_atlas_uri
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

4. Start development servers:
```bash
npm run dev # Starts backend
cd client
npm run dev # Starts frontend
```

### 1. Clone the repository

```bash
git clone <repository-url>
cd ai-resume-builder
```

### 2. Install server dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory with the following variables:

```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/ai-resume-builder
JWT_SECRET=your_jwt_secret_key
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key
ADMIN_ID=your_admin_id
ADMIN_PASSWORD=your_admin_password
```

### 4. Install client dependencies

```bash
npm run client-install
```

## Running the Application

### Development mode

To run both the server and client in development mode:

```bash
npm run dev
```

This will start the server on port 5000 and the client on port 5173 (Vite default).

To run only the server:

```bash
npm run server
```

To run only the client:

```bash
npm run client
```

### Production mode

To build the client for production:

```bash
cd client
npm run build
```

Then start the server:

```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/users` - Register a new user
- `POST /api/auth` - Login and get token
- `GET /api/auth` - Get authenticated user

### Admin
- `POST /api/admin/login` - Admin login
- `GET /api/admin/users` - Get all users (admin only)
- `DELETE /api/admin/users/:id` - Delete a user (admin only)
- `GET /api/admin/resumes` - Get all resumes (admin only)
- `GET /api/admin/applications` - Get all applications (admin only)
- `GET /api/admin/jobs` - Get all jobs (admin only)

### Resumes
- `GET /api/resumes` - Get all resumes for a user
- `GET /api/resumes/:id` - Get a specific resume
- `POST /api/resumes` - Create a new resume
- `PUT /api/resumes/:id` - Update a resume
- `DELETE /api/resumes/:id` - Delete a resume

### AI Features
- `POST /api/ai/optimize-experience` - Optimize work experience descriptions
- `POST /api/ai/suggest-skills` - Get skill suggestions based on job title and resume content

### Jobs
- `GET /api/jobs` - Get all jobs (with optional filtering)
- `GET /api/jobs/:id` - Get a specific job
- `POST /api/jobs` - Create a new job (admin)
- `PUT /api/jobs/:id` - Update a job (admin)
- `DELETE /api/jobs/:id` - Delete a job (admin)

### Applications
- `GET /api/applications` - Get all applications for a user
- `GET /api/applications/:id` - Get a specific application
- `POST /api/applications` - Create a new application
- `PUT /api/applications/:id` - Update an application status
- `DELETE /api/applications/:id` - Delete an application

### Matching
- `POST /api/matching/resume-to-jobs` - Match resume to jobs
- `POST /api/matching/resume-to-job` - Match resume to a specific job

### Analytics
- `GET /api/analytics/dashboard` - Get user analytics dashboard data

## Project Structure

```
├── client/                 # React frontend
│   ├── public/             # Static files
│   └── src/                # React source files
│       ├── assets/         # Images, fonts, etc.
│       ├── components/     # React components
│       │   ├── admin/      # Admin dashboard components
│       │   ├── analytics/  # Analytics visualization components
│       │   ├── applications/ # Application tracking components
│       │   ├── auth/       # Authentication components
│       │   ├── jobs/       # Job listing components
│       │   ├── landing/    # Landing page components
│       │   ├── layout/     # Shared layout components
│       │   ├── resume/     # Resume builder components
│       │   └── ui/        # Reusable UI components
│       ├── redux/          # State management
│       │   ├── slices/     # Redux toolkit slices
│       │   └── store.js    # Redux store configuration
│       ├── App.css        # Main styles
│       ├── App.jsx        # Root component
│       └── main.jsx       # Entry point
├── config/                 # Database configuration
├── middleware/            # Express middleware (authentication, etc)
├── models/                # MongoDB models
│   ├── Application.js     # Job applications model
│   ├── Job.js             # Job listings model
│   ├── Resume.js          # Resume templates model
│   ├── User.js            # User account model
│   └── UserAnalytics.js   # Analytics data model
├── routes/                # API route handlers
│   └── api/               # Versioned API endpoints
│       ├── admin.js       # Admin management routes
│       ├── ai.js          # AI integration endpoints
│       ├── analytics.js   # Analytics data routes
│       ├── applications.js # Application tracking routes
│       ├── auth.js        # Authentication routes
│       ├── jobs.js        # Job listing routes
│       ├── matching.js    # Job matching algorithms
│       ├── resumes.js     # Resume management
│       └── users.js       # User profile routes
└── server.js             # Express server entry point
```
