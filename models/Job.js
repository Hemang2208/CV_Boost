import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  location: {
    type: String
  },
  description: {
    type: String,
    required: true
  },
  requirements: {
    type: String,
    required: true
  },
  skills: [
    {
      type: String
    }
  ],
  salary: {
    type: String
  },
  jobType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'],
    default: 'Full-time'
  },
  industry: {
    type: String
  },
  experienceLevel: {
    type: String,
    enum: ['Entry-level', 'Mid-level', 'Senior', 'Executive'],
    default: 'Mid-level'
  },
  educationLevel: {
    type: String,
    enum: ['High School', 'Associate', 'Bachelor', 'Master', 'Doctorate', 'None'],
    default: 'Bachelor'
  },
  applicationUrl: {
    type: String
  },
  source: {
    type: String,
    enum: ['LinkedIn', 'Indeed', 'Manual', 'Other'],
    default: 'Manual'
  },
  sourceId: {
    type: String
  },
  postedDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('job', JobSchema);