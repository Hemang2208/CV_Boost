import mongoose from 'mongoose';

const UserAnalyticsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  resumeViews: {
    type: Number,
    default: 0
  },
  jobMatchData: [
    {
      job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'job'
      },
      matchPercentage: {
        type: Number,
        default: 0
      },
      date: {
        type: Date,
        default: Date.now
      }
    }
  ],
  applicationStats: {
    totalApplications: {
      type: Number,
      default: 0
    },
    pending: {
      type: Number,
      default: 0
    },
    interviews: {
      type: Number,
      default: 0
    },
    offers: {
      type: Number,
      default: 0
    },
    rejections: {
      type: Number,
      default: 0
    },
    withdrawn: {
      type: Number,
      default: 0
    }
  },
  responseTimeData: [
    {
      application: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'application'
      },
      responseTime: {
        type: Number, // in days
        default: 0
      },
      status: {
        type: String,
        enum: ['Viewed', 'Interview', 'Offer', 'Rejected']
      },
      date: {
        type: Date,
        default: Date.now
      }
    }
  ],
  suggestions: [
    {
      content: {
        type: String
      },
      category: {
        type: String,
        enum: ['Skills', 'JobCategory', 'ResumeOptimization', 'ApplicationStrategy']
      },
      isRead: {
        type: Boolean,
        default: false
      },
      date: {
        type: Date,
        default: Date.now
      }
    }
  ],
  weeklySummaries: [
    {
      week: {
        type: Date
      },
      applicationsSubmitted: {
        type: Number,
        default: 0
      },
      interviews: {
        type: Number,
        default: 0
      },
      offers: {
        type: Number,
        default: 0
      },
      rejections: {
        type: Number,
        default: 0
      },
      averageMatchRate: {
        type: Number,
        default: 0
      }
    }
  ],
  monthlySummaries: [
    {
      month: {
        type: Date
      },
      applicationsSubmitted: {
        type: Number,
        default: 0
      },
      interviews: {
        type: Number,
        default: 0
      },
      offers: {
        type: Number,
        default: 0
      },
      rejections: {
        type: Number,
        default: 0
      },
      averageMatchRate: {
        type: Number,
        default: 0
      }
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

export default mongoose.model('userAnalytics', UserAnalyticsSchema);