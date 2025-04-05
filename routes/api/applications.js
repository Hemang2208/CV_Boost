import express from 'express';
const router = express.Router();
import { check, validationResult } from 'express-validator';
import auth from '../../middleware/auth.js';
import mongoose from 'mongoose';

import Application from '../../models/Application.js';
import Resume from '../../models/Resume.js';
import Job from '../../models/Job.js';

// @route   GET api/applications
// @desc    Get all applications for the current user
// @access  Private
router.get('/', auth, async (req, res) => {
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

// @route   GET api/applications/:id
// @desc    Get application by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('job', ['title', 'company', 'location', 'description', 'requirements', 'skills'])
      .populate('resume', ['template', 'personalInfo', 'workExperience', 'education', 'skills']);

    if (!application) {
      return res.status(404).json({ msg: 'Application not found' });
    }

    // Check if the application belongs to the user
    if (application.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    res.json(application);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Application not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/applications
// @desc    Create a new application
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('job', 'Job is required').not().isEmpty(),
      check('resume', 'Resume is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { job, resume, coverLetter, notes } = req.body;

    try {
      // Check if job exists
      const jobExists = await Job.findById(job);
      if (!jobExists) {
        return res.status(404).json({ msg: 'Job not found' });
      }

      // Check if resume exists and belongs to user
      const resumeExists = await Resume.findById(resume);
      if (!resumeExists) {
        return res.status(404).json({ msg: 'Resume not found' });
      }
      if (resumeExists.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'Not authorized to use this resume' });
      }

      // Check if already applied
      const existingApplication = await Application.findOne({
        user: req.user.id,
        job
      });

      if (existingApplication) {
        return res.status(400).json({ msg: 'You have already applied for this job' });
      }

      // Create new application
      const newApplication = new Application({
        user: req.user.id,
        job,
        resume,
        coverLetter,
        notes
      });

      const application = await newApplication.save();

      res.json(application);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT api/applications/:id
// @desc    Update application status and notes
// @access  Private
router.put('/:id', auth, async (req, res) => {
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

// @route   DELETE api/applications/:id
// @desc    Delete an application
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ msg: 'Application not found' });
    }

    // Check if the application belongs to the user
    if (application.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await application.deleteOne();

    res.json({ msg: 'Application removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Application not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   GET api/applications/stats
// @desc    Get application statistics for the user
// @access  Private
router.get('/stats/me', auth, async (req, res) => {
  try {
    // Get counts by status
    const statusCounts = await Application.aggregate([
      { $match: { user: mongoose.Types.ObjectId(req.user.id) } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Format the results
    const stats = {
      total: 0,
      applied: 0,
      viewed: 0,
      interview: 0,
      offer: 0,
      rejected: 0,
      withdrawn: 0
    };

    statusCounts.forEach(item => {
      const status = item._id.toLowerCase();
      stats[status] = item.count;
      stats.total += item.count;
    });

    res.json(stats);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;