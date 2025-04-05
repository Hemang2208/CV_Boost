import express from 'express';
const router = express.Router();
import { check, validationResult } from 'express-validator';
import auth from '../../middleware/auth.js';

import Resume from '../../models/Resume.js';
import User from '../../models/User.js';

// @route   GET api/resumes
// @desc    Get all resumes for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user.id }).sort({
      updatedAt: -1
    });
    res.json(resumes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/resumes/:id
// @desc    Get resume by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ msg: 'Resume not found' });
    }

    // Check user owns the resume
    if (resume.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    res.json(resume);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Resume not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/resumes
// @desc    Create a resume
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('template', 'Template is required').not().isEmpty(),
      check('personalInfo.name', 'Name is required').not().isEmpty(),
      check('personalInfo.email', 'Email is required').isEmail()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const resumeFields = {
        user: req.user.id,
        template: req.body.template,
        personalInfo: req.body.personalInfo || {},
        workExperience: req.body.workExperience || [],
        education: req.body.education || [],
        skills: req.body.skills || [],
        suggestedSkills: req.body.suggestedSkills || []
      };

      const resume = new Resume(resumeFields);

      await resume.save();

      res.json(resume);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT api/resumes/:id
// @desc    Update a resume
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    let resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ msg: 'Resume not found' });
    }

    // Check user owns the resume
    if (resume.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Update fields
    if (req.body.template) resume.template = req.body.template;
    if (req.body.personalInfo) resume.personalInfo = req.body.personalInfo;
    if (req.body.workExperience) resume.workExperience = req.body.workExperience;
    if (req.body.education) resume.education = req.body.education;
    if (req.body.skills) resume.skills = req.body.skills;
    if (req.body.suggestedSkills) resume.suggestedSkills = req.body.suggestedSkills;
    
    resume.updatedAt = Date.now();

    await resume.save();

    res.json(resume);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Resume not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/resumes/:id
// @desc    Delete a resume
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ msg: 'Resume not found' });
    }

    // Check user owns the resume
    if (resume.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await resume.deleteOne();

    res.json({ msg: 'Resume removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Resume not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/resumes/apply-optimization/:id
// @desc    Apply AI optimization suggestions to a resume
// @access  Private
router.post('/apply-optimization/:id', auth, async (req, res) => {
  try {
    const { optimizationData } = req.body;
    
    if (!optimizationData) {
      return res.status(400).json({ msg: 'Optimization data is required' });
    }

    // Get the resume
    let resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ msg: 'Resume not found' });
    }

    // Check if the resume belongs to the user
    if (resume.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Apply optimization suggestions
    if (optimizationData.summary && resume.personalInfo) {
      resume.personalInfo.summary = optimizationData.summary;
    }

    // Update skills based on suggestions
    if (optimizationData.skills && optimizationData.skills.length > 0) {
      // Add suggested skills to suggestedSkills array if they don't already exist
      const existingSkillNames = resume.skills.map(skill => skill.name.toLowerCase());
      const newSuggestedSkills = optimizationData.skills.filter(
        skill => !existingSkillNames.includes(skill.toLowerCase())
      );
      
      resume.suggestedSkills = [...new Set([...resume.suggestedSkills, ...newSuggestedSkills])];
    }

    // Update work experience descriptions if provided
    if (optimizationData.experience && optimizationData.experience.length > 0 && resume.workExperience) {
      // Assuming the experience array contains objects with index and optimized description
      optimizationData.experience.forEach(exp => {
        if (exp.index !== undefined && exp.description && resume.workExperience[exp.index]) {
          resume.workExperience[exp.index].optimizedDescription = exp.description;
        }
      });
    }

    // Update education descriptions if provided
    if (optimizationData.education && optimizationData.education.length > 0 && resume.education) {
      // Assuming the education array contains objects with index and optimized description
      optimizationData.education.forEach(edu => {
        if (edu.index !== undefined && edu.description && resume.education[edu.index]) {
          resume.education[edu.index].description = edu.description;
        }
      });
    }

    // Store keywords from job description
    if (optimizationData.keywords && optimizationData.keywords.length > 0) {
      resume.jobKeywords = optimizationData.keywords;
    }

    resume.updatedAt = Date.now();
    await resume.save();

    res.json(resume);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;