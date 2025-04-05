import mongoose from 'mongoose';

const ResumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  template: {
    type: String,
    required: true
  },
  personalInfo: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String
    },
    address: {
      type: String
    },
    linkedin: {
      type: String
    },
    website: {
      type: String
    },
    summary: {
      type: String
    }
  },
  workExperience: [
    {
      company: {
        type: String,
        required: true
      },
      position: {
        type: String,
        required: true
      },
      location: {
        type: String
      },
      startDate: {
        type: Date,
        required: true
      },
      endDate: {
        type: Date
      },
      current: {
        type: Boolean,
        default: false
      },
      description: {
        type: String
      },
      achievements: [
        {
          type: String
        }
      ],
      optimizedDescription: {
        type: String
      }
    }
  ],
  education: [
    {
      institution: {
        type: String,
        required: true
      },
      degree: {
        type: String,
        required: true
      },
      fieldOfStudy: {
        type: String
      },
      location: {
        type: String
      },
      startDate: {
        type: Date,
        required: true
      },
      endDate: {
        type: Date
      },
      current: {
        type: Boolean,
        default: false
      },
      description: {
        type: String
      }
    }
  ],
  skills: [
    {
      name: {
        type: String,
        required: true
      },
      level: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
        default: 'Intermediate'
      }
    }
  ],
  suggestedSkills: [
    {
      type: String
    }
  ],
  jobKeywords: [
    {
      type: String
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('resume', ResumeSchema);