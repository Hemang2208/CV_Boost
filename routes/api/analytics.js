import express from 'express';
const router = express.Router();
import { check, validationResult } from 'express-validator';
import auth from '../../middleware/auth.js';
import mongoose from 'mongoose';
import { OpenAI } from 'openai';

import User from '../../models/User.js';
import Application from '../../models/Application.js';
import Resume from '../../models/Resume.js';
import Job from '../../models/Job.js';
import UserAnalytics from '../../models/UserAnalytics.js';

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// @route   GET api/analytics/dashboard
// @desc    Get user analytics dashboard data
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    // Find or create user analytics
    let userAnalytics = await UserAnalytics.findOne({ user: req.user.id });
    
    if (!userAnalytics) {
      userAnalytics = new UserAnalytics({
        user: req.user.id
      });
      await userAnalytics.save();
    }

    // Get application statistics
    const applications = await Application.find({ user: req.user.id });
    const totalApplications = applications.length;
    
    // Count applications by status
    const statusCounts = {
      Applied: 0,
      Viewed: 0,
      Interview: 0,
      Offer: 0,
      Rejected: 0,
      Withdrawn: 0
    };
    
    applications.forEach(app => {
      statusCounts[app.status]++;
    });
    
    // Update user analytics with latest application stats
    userAnalytics.applicationStats.totalApplications = totalApplications;
    userAnalytics.applicationStats.pending = statusCounts.Applied + statusCounts.Viewed;
    userAnalytics.applicationStats.interviews = statusCounts.Interview;
    userAnalytics.applicationStats.offers = statusCounts.Offer;
    userAnalytics.applicationStats.rejections = statusCounts.Rejected;
    userAnalytics.applicationStats.withdrawn = statusCounts.Withdrawn;
    
    await userAnalytics.save();
    
    res.json(userAnalytics);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/analytics/applications/summary
// @desc    Get application summary data (weekly/monthly)
// @access  Private
router.get('/applications/summary', auth, async (req, res) => {
  try {
    const { period } = req.query; // 'weekly' or 'monthly'
    const userAnalytics = await UserAnalytics.findOne({ user: req.user.id });
    
    if (!userAnalytics) {
      return res.status(404).json({ msg: 'Analytics data not found' });
    }
    
    const summaries = period === 'monthly' ? userAnalytics.monthlySummaries : userAnalytics.weeklySummaries;
    
    // Sort summaries by date (newest first)
    const sortedSummaries = summaries.sort((a, b) => new Date(b.week || b.month) - new Date(a.week || a.month));
    
    res.json(sortedSummaries);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/analytics/suggestions
// @desc    Get personalized suggestions based on application data
// @access  Private
router.get('/suggestions', auth, async (req, res) => {
  try {
    const userAnalytics = await UserAnalytics.findOne({ user: req.user.id });
    
    if (!userAnalytics) {
      return res.status(404).json({ msg: 'Analytics data not found' });
    }
    
    // Get unread suggestions
    const unreadSuggestions = userAnalytics.suggestions.filter(suggestion => !suggestion.isRead);
    
    res.json(unreadSuggestions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/analytics/suggestions/:id
// @desc    Mark suggestion as read
// @access  Private
router.put('/suggestions/:id', auth, async (req, res) => {
  try {
    const userAnalytics = await UserAnalytics.findOne({ user: req.user.id });
    
    if (!userAnalytics) {
      return res.status(404).json({ msg: 'Analytics data not found' });
    }
    
    // Find the suggestion by ID
    const suggestion = userAnalytics.suggestions.id(req.params.id);
    
    if (!suggestion) {
      return res.status(404).json({ msg: 'Suggestion not found' });
    }
    
    // Mark as read
    suggestion.isRead = true;
    await userAnalytics.save();
    
    res.json(userAnalytics.suggestions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/analytics/generate-insights
// @desc    Generate insights and suggestions based on user's application data
// @access  Private
router.post('/generate-insights', auth, async (req, res) => {
  try {
    // Get user's applications
    const applications = await Application.find({ user: req.user.id })
      .populate('job', ['title', 'company', 'skills', 'industry'])
      .populate('resume', ['skills']);
    
    if (applications.length === 0) {
      return res.status(400).json({ msg: 'No applications found to generate insights' });
    }
    
    // Find or create user analytics
    let userAnalytics = await UserAnalytics.findOne({ user: req.user.id });
    
    if (!userAnalytics) {
      userAnalytics = new UserAnalytics({
        user: req.user.id
      });
    }
    
    // Generate insights using OpenAI
    const insights = await generateInsightsWithAI(applications);
    
    // Add new suggestions
    insights.forEach(insight => {
      userAnalytics.suggestions.push({
        content: insight.content,
        category: insight.category,
        date: Date.now()
      });
    });
    
    await userAnalytics.save();
    
    res.json(insights);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/analytics/update-weekly-summary
// @desc    Update weekly application summary
// @access  Private
router.post('/update-weekly-summary', auth, async (req, res) => {
  try {
    // Get user's applications from the past week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const applications = await Application.find({
      user: req.user.id,
      appliedDate: { $gte: oneWeekAgo }
    });
    
    // Find or create user analytics
    let userAnalytics = await UserAnalytics.findOne({ user: req.user.id });
    
    if (!userAnalytics) {
      userAnalytics = new UserAnalytics({
        user: req.user.id
      });
    }
    
    // Count applications by status
    const statusCounts = {
      Applied: 0,
      Viewed: 0,
      Interview: 0,
      Offer: 0,
      Rejected: 0,
      Withdrawn: 0
    };
    
    applications.forEach(app => {
      statusCounts[app.status]++;
    });
    
    // Calculate average match rate from job match data in the past week
    const recentMatches = userAnalytics.jobMatchData.filter(
      match => new Date(match.date) >= oneWeekAgo
    );
    
    let averageMatchRate = 0;
    if (recentMatches.length > 0) {
      averageMatchRate = recentMatches.reduce((sum, match) => sum + match.matchPercentage, 0) / recentMatches.length;
    }
    
    // Create weekly summary
    const weeklySummary = {
      week: new Date(),
      applicationsSubmitted: applications.length,
      interviews: statusCounts.Interview,
      offers: statusCounts.Offer,
      rejections: statusCounts.Rejected,
      averageMatchRate
    };
    
    // Add to weekly summaries
    userAnalytics.weeklySummaries.push(weeklySummary);
    
    // Limit to last 12 weeks
    if (userAnalytics.weeklySummaries.length > 12) {
      userAnalytics.weeklySummaries = userAnalytics.weeklySummaries.slice(-12);
    }
    
    await userAnalytics.save();
    
    res.json(weeklySummary);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/analytics/update-monthly-summary
// @desc    Update monthly application summary
// @access  Private
router.post('/update-monthly-summary', auth, async (req, res) => {
  try {
    // Get user's applications from the past month
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const applications = await Application.find({
      user: req.user.id,
      appliedDate: { $gte: oneMonthAgo }
    });
    
    // Find or create user analytics
    let userAnalytics = await UserAnalytics.findOne({ user: req.user.id });
    
    if (!userAnalytics) {
      userAnalytics = new UserAnalytics({
        user: req.user.id
      });
    }
    
    // Count applications by status
    const statusCounts = {
      Applied: 0,
      Viewed: 0,
      Interview: 0,
      Offer: 0,
      Rejected: 0,
      Withdrawn: 0
    };
    
    applications.forEach(app => {
      statusCounts[app.status]++;
    });
    
    // Calculate average match rate from job match data in the past month
    const recentMatches = userAnalytics.jobMatchData.filter(
      match => new Date(match.date) >= oneMonthAgo
    );
    
    let averageMatchRate = 0;
    if (recentMatches.length > 0) {
      averageMatchRate = recentMatches.reduce((sum, match) => sum + match.matchPercentage, 0) / recentMatches.length;
    }
    
    // Create monthly summary
    const monthlySummary = {
      month: new Date(),
      applicationsSubmitted: applications.length,
      interviews: statusCounts.Interview,
      offers: statusCounts.Offer,
      rejections: statusCounts.Rejected,
      averageMatchRate
    };
    
    // Add to monthly summaries
    userAnalytics.monthlySummaries.push(monthlySummary);
    
    // Limit to last 12 months
    if (userAnalytics.monthlySummaries.length > 12) {
      userAnalytics.monthlySummaries = userAnalytics.monthlySummaries.slice(-12);
    }
    
    await userAnalytics.save();
    
    res.json(monthlySummary);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/analytics/track-resume-view/:resumeId
// @desc    Track when a resume is viewed
// @access  Private
router.post('/track-resume-view/:resumeId', auth, async (req, res) => {
  try {
    // Find or create user analytics
    let userAnalytics = await UserAnalytics.findOne({ user: req.user.id });
    
    if (!userAnalytics) {
      userAnalytics = new UserAnalytics({
        user: req.user.id
      });
    }
    
    // Increment resume views
    userAnalytics.resumeViews += 1;
    await userAnalytics.save();
    
    res.json({ resumeViews: userAnalytics.resumeViews });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/analytics/track-job-match
// @desc    Track job match percentage
// @access  Private
router.post('/track-job-match', 
  [
    auth,
    [
      check('jobId', 'Job ID is required').not().isEmpty(),
      check('matchPercentage', 'Match percentage is required').isNumeric()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { jobId, matchPercentage } = req.body;

    try {
      // Find or create user analytics
      let userAnalytics = await UserAnalytics.findOne({ user: req.user.id });
      
      if (!userAnalytics) {
        userAnalytics = new UserAnalytics({
          user: req.user.id
        });
      }
      
      // Add job match data
      userAnalytics.jobMatchData.push({
        job: jobId,
        matchPercentage,
        date: Date.now()
      });
      
      await userAnalytics.save();
      
      res.json(userAnalytics.jobMatchData);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   POST api/analytics/track-application-response
// @desc    Track application response time and status
// @access  Private
router.post('/track-application-response', 
  [
    auth,
    [
      check('applicationId', 'Application ID is required').not().isEmpty(),
      check('status', 'Status is required').isIn(['Viewed', 'Interview', 'Offer', 'Rejected']),
      check('responseTime', 'Response time is required').isNumeric()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { applicationId, status, responseTime } = req.body;

    try {
      // Find or create user analytics
      let userAnalytics = await UserAnalytics.findOne({ user: req.user.id });
      
      if (!userAnalytics) {
        userAnalytics = new UserAnalytics({
          user: req.user.id
        });
      }
      
      // Add response time data
      userAnalytics.responseTimeData.push({
        application: applicationId,
        status,
        responseTime,
        date: Date.now()
      });
      
      await userAnalytics.save();
      
      res.json(userAnalytics.responseTimeData);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/analytics/response-time
// @desc    Get response time data for analytics
// @access  Private
router.get('/response-time', auth, async (req, res) => {
  try {
    const userAnalytics = await UserAnalytics.findOne({ user: req.user.id });
    
    if (!userAnalytics) {
      return res.status(404).json({ msg: 'Analytics data not found' });
    }
    
    res.json(userAnalytics.responseTimeData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/analytics/job-match-data
// @desc    Get job match data for analytics
// @access  Private
router.get('/job-match-data', auth, async (req, res) => {
  try {
    const userAnalytics = await UserAnalytics.findOne({ user: req.user.id });
    
    if (!userAnalytics) {
      return res.status(404).json({ msg: 'Analytics data not found' });
    }
    
    res.json(userAnalytics.jobMatchData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Helper function to generate insights with AI
async function generateInsightsWithAI(applications) {
  try {
    // Extract relevant data for analysis
    const applicationData = applications.map(app => ({
      jobTitle: app.job.title,
      company: app.job.company,
      status: app.status,
      jobSkills: app.job.skills,
      resumeSkills: app.resume ? app.resume.skills : [],
      industry: app.job.industry
    }));

    // Prepare prompt for OpenAI
    const prompt = `
      Based on the following job application data, provide 3 actionable insights to improve job application success rate:
      ${JSON.stringify(applicationData)}
      
      Format each insight as a JSON object with the following structure:
      {
        "content": "The specific suggestion or insight",
        "category": "One of: Skills, JobCategory, ResumeOptimization, ApplicationStrategy"
      }
      
      Return only a valid JSON array of these objects.
    `;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a career advisor AI that analyzes job application data and provides actionable insights." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    // Parse and return insights
    const insightsText = response.choices[0].message.content.trim();
    let insights = [];
    
    try {
      insights = JSON.parse(insightsText);
    } catch (err) {
      console.error('Error parsing OpenAI response:', err);
      // Fallback to default insights if parsing fails
      insights = [
        {
          content: "Consider adding more technical skills to your resume to improve match rates.",
          category: "Skills"
        },
        {
          content: "Your application success rate is higher for mid-level positions. Consider focusing on these roles.",
          category: "JobCategory"
        },
        {
          content: "Customize your resume for each application to highlight relevant experience.",
          category: "ResumeOptimization"
        }
      ];
    }
    
    return insights;
  } catch (err) {
    console.error('Error generating insights:', err);
    // Return default insights if OpenAI call fails
    return [
      {
        content: "Consider adding more technical skills to your resume to improve match rates.",
        category: "Skills"
      },
      {
        content: "Your application success rate is higher for mid-level positions. Consider focusing on these roles.",
        category: "JobCategory"
      },
      {
        content: "Customize your resume for each application to highlight relevant experience.",
        category: "ResumeOptimization"
      }
    ];
  }
}

export default router;