import express from 'express';
const router = express.Router();
import { check, validationResult } from 'express-validator';
import auth from '../../middleware/auth.js';
import axios from 'axios';

import Job from '../../models/Job.js';
import Application from '../../models/Application.js';

// @route   GET api/jobs
// @desc    Get all jobs
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, location, jobType, experienceLevel, limit = 20, page = 1 } = req.query;
    
    // Build query object
    const query = { isActive: true };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    
    if (jobType) {
      query.jobType = jobType;
    }
    
    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get jobs with pagination
    const jobs = await Job.find(query)
      .sort({ postedDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const total = await Job.countDocuments(query);
    
    res.json({
      jobs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/jobs/:id
// @desc    Get job by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    res.json(job);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Job not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/jobs
// @desc    Create a job
// @access  Private (Admin only - would need admin middleware)
router.post(
  '/',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('company', 'Company is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('requirements', 'Requirements are required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      location,
      description,
      requirements,
      skills,
      salary,
      jobType,
      industry,
      experienceLevel,
      educationLevel,
      applicationUrl,
      expiryDate
    } = req.body;

    try {
      // Create new job
      const newJob = new Job({
        title,
        company,
        location,
        description,
        requirements,
        skills,
        salary,
        jobType,
        industry,
        experienceLevel,
        educationLevel,
        applicationUrl,
        expiryDate
      });

      const job = await newJob.save();

      res.json(job);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT api/jobs/:id
// @desc    Update a job
// @access  Private (Admin only - would need admin middleware)
router.put('/:id', auth, async (req, res) => {
  const {
    title,
    company,
    location,
    description,
    requirements,
    skills,
    salary,
    jobType,
    industry,
    experienceLevel,
    educationLevel,
    applicationUrl,
    expiryDate,
    isActive
  } = req.body;

  // Build job object
  const jobFields = {};
  if (title) jobFields.title = title;
  if (company) jobFields.company = company;
  if (location) jobFields.location = location;
  if (description) jobFields.description = description;
  if (requirements) jobFields.requirements = requirements;
  if (skills) jobFields.skills = skills;
  if (salary) jobFields.salary = salary;
  if (jobType) jobFields.jobType = jobType;
  if (industry) jobFields.industry = industry;
  if (experienceLevel) jobFields.experienceLevel = experienceLevel;
  if (educationLevel) jobFields.educationLevel = educationLevel;
  if (applicationUrl) jobFields.applicationUrl = applicationUrl;
  if (expiryDate) jobFields.expiryDate = expiryDate;
  if (isActive !== undefined) jobFields.isActive = isActive;
  
  jobFields.updatedAt = Date.now();

  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    // Update
    job = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: jobFields },
      { new: true }
    );

    res.json(job);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/jobs/:id
// @desc    Delete a job
// @access  Private (Admin only - would need admin middleware)
router.delete('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    await job.deleteOne();

    res.json({ msg: 'Job removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Job not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/jobs/apply/:id
// @desc    Apply for a job
// @access  Private
router.post('/apply/:id', auth, async (req, res) => {
  try {
    const { resumeId, coverLetter, notes } = req.body;
    
    // Check if job exists
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }
    
    // Check if already applied
    const existingApplication = await Application.findOne({
      user: req.user.id,
      job: req.params.id
    });
    
    if (existingApplication) {
      return res.status(400).json({ msg: 'You have already applied for this job' });
    }
    
    // Create new application
    const newApplication = new Application({
      user: req.user.id,
      resume: resumeId,
      job: req.params.id,
      coverLetter,
      notes
    });
    
    const application = await newApplication.save();
    
    res.json(application);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/jobs/applications
// @desc    Get all applications for the user
// @access  Private
router.get('/applications/me', auth, async (req, res) => {
  try {
    const applications = await Application.find({ user: req.user.id })
      .populate('job', ['title', 'company', 'location'])
      .populate('resume', ['template', 'personalInfo.name'])
      .sort({ appliedDate: -1 });
    
    res.json(applications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/jobs/applications/:id
// @desc    Update application status
// @access  Private
router.put('/applications/:id', auth, async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    // Find application
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ msg: 'Application not found' });
    }
    
    // Check if the application belongs to the user
    if (application.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    // Update fields
    if (status) application.status = status;
    if (notes) application.notes = notes;
    application.lastUpdated = Date.now();
    
    await application.save();
    
    res.json(application);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/jobs/external
// @desc    Fetch jobs from external APIs
// @access  Private
router.get('/external/search', auth, async (req, res) => {
  try {
    const { query, location, limit = 10 } = req.query;
    
    // This is a placeholder for integrating with external APIs like LinkedIn or Indeed
    // In a real implementation, you would use their official APIs with proper authentication
    
    // Example of how you might fetch from an external API
    // const response = await axios.get(`https://api.example.com/jobs?q=${query}&location=${location}&limit=${limit}`);
    // const externalJobs = response.data;
    
    // For now, return a mock response
    const externalJobs = [
      {
        id: 'ext-1',
        title: 'Software Engineer',
        company: 'Tech Company',
        location: 'Remote',
        description: 'Job description here...',
        url: 'https://example.com/job/1',
        source: 'External API'
      },
      {
        id: 'ext-2',
        title: 'Product Manager',
        company: 'Product Company',
        location: 'New York, NY',
        description: 'Job description here...',
        url: 'https://example.com/job/2',
        source: 'External API'
      }
    ];
    
    res.json(externalJobs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/jobs/import
// @desc    Import a job from external source
// @access  Private
router.post('/import', auth, async (req, res) => {
  try {
    const { externalId, source, jobData } = req.body;
    
    // Check if job already exists
    const existingJob = await Job.findOne({ sourceId: externalId, source });
    
    if (existingJob) {
      return res.status(400).json({ msg: 'Job already imported' });
    }
    
    // Create new job from external data
    const newJob = new Job({
      title: jobData.title,
      company: jobData.company,
      location: jobData.location,
      description: jobData.description,
      requirements: jobData.requirements || 'Not specified',
      applicationUrl: jobData.url,
      source,
      sourceId: externalId
    });
    
    const job = await newJob.save();
    
    res.json(job);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;