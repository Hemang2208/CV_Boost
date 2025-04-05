import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  resume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'resume'
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'job',
    required: true
  },
  status: {
    type: String,
    enum: ['Applied', 'Viewed', 'Interview', 'Offer', 'Rejected', 'Withdrawn'],
    default: 'Applied'
  },
  coverLetter: {
    type: String
  },
  notes: {
    type: String
  },
  appliedDate: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('application', ApplicationSchema);