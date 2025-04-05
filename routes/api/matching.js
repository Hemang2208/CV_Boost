import express from 'express';
const router = express.Router();
import auth from '../../middleware/auth.js';
import { OpenAI } from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

import Resume from '../../models/Resume.js';
import Job from '../../models/Job.js';

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Initialize Google Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @route   POST api/matching/resume-to-jobs
// @desc    Match resume to jobs
// @access  Private
router.post('/resume-to-jobs', auth, async (req, res) => {
  try {
    const { resumeId, limit = 10 } = req.body;

    // Get the resume
    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ msg: 'Resume not found' });
    }

    // Check if the resume belongs to the user
    if (resume.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Get all active jobs
    const jobs = await Job.find({ isActive: true }).limit(100); // Limit to 100 for performance

    if (jobs.length === 0) {
      return res.json({ matches: [] });
    }

    // Extract resume content
    const resumeContent = extractResumeContent(resume);

    // Match resume to jobs using AI
    try {
      const matches = await matchResumeToJobsWithOpenAI(resumeContent, jobs, limit);
      return res.json({ matches });
    } catch (openaiError) {
      console.error('OpenAI error:', openaiError);
      try {
        const matches = await matchResumeToJobsWithGemini(resumeContent, jobs, limit);
        return res.json({ matches });
      } catch (geminiError) {
        console.error('Gemini error:', geminiError);
        throw new Error('Both AI services failed');
      }
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/matching/job-to-resumes
// @desc    Match job to user's resumes
// @access  Private
router.post('/job-to-resumes', auth, async (req, res) => {
  try {
    const { jobId } = req.body;

    // Get the job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    // Get all user's resumes
    const resumes = await Resume.find({ user: req.user.id });

    if (resumes.length === 0) {
      return res.json({ matches: [] });
    }

    // Extract job content
    const jobContent = `
      Title: ${job.title}
      Company: ${job.company}
      Description: ${job.description}
      Requirements: ${job.requirements}
      Skills: ${job.skills ? job.skills.join(', ') : ''}
      Industry: ${job.industry || ''}
      Experience Level: ${job.experienceLevel || ''}
      Education Level: ${job.educationLevel || ''}
    `;

    // Match job to resumes using AI
    try {
      const matches = await matchJobToResumesWithOpenAI(jobContent, resumes);
      return res.json({ matches });
    } catch (openaiError) {
      console.error('OpenAI error:', openaiError);
      try {
        const matches = await matchJobToResumesWithGemini(jobContent, resumes);
        return res.json({ matches });
      } catch (geminiError) {
        console.error('Gemini error:', geminiError);
        throw new Error('Both AI services failed');
      }
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/matching/optimize-resume
// @desc    Optimize resume for a specific job
// @access  Private
router.post('/optimize-resume', auth, async (req, res) => {
  try {
    const { resumeId, jobId } = req.body;

    // Get the resume
    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ msg: 'Resume not found' });
    }

    // Check if the resume belongs to the user
    if (resume.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Get the job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    // Extract resume and job content
    const resumeContent = extractResumeContent(resume);
    const jobContent = `
      Title: ${job.title}
      Company: ${job.company}
      Description: ${job.description}
      Requirements: ${job.requirements}
      Skills: ${job.skills ? job.skills.join(', ') : ''}
      Industry: ${job.industry || ''}
      Experience Level: ${job.experienceLevel || ''}
      Education Level: ${job.educationLevel || ''}
    `;

    // Optimize resume for job using AI
    try {
      const optimization = await optimizeResumeForJobWithOpenAI(resumeContent, jobContent);
      return res.json(optimization);
    } catch (openaiError) {
      console.error('OpenAI error:', openaiError);
      try {
        const optimization = await optimizeResumeForJobWithGemini(resumeContent, jobContent);
        return res.json(optimization);
      } catch (geminiError) {
        console.error('Gemini error:', geminiError);
        throw new Error('Both AI services failed');
      }
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/matching/analyze-portfolio
// @desc    Analyze portfolio images for job matching
// @access  Private
router.post('/analyze-portfolio', auth, async (req, res) => {
  try {
    const { portfolioUrls, jobId } = req.body;

    if (!portfolioUrls || portfolioUrls.length === 0) {
      return res.status(400).json({ msg: 'Portfolio URLs are required' });
    }

    // Get the job if provided
    let jobContent = '';
    if (jobId) {
      const job = await Job.findById(jobId);
      if (job) {
        jobContent = `
          Title: ${job.title}
          Company: ${job.company}
          Description: ${job.description}
          Requirements: ${job.requirements}
          Skills: ${job.skills ? job.skills.join(', ') : ''}
          Industry: ${job.industry || ''}
        `;
      }
    }

    // Analyze portfolio using Google Gemini (which has multimodal capabilities)
    try {
      const analysis = await analyzePortfolioWithGemini(portfolioUrls, jobContent);
      return res.json(analysis);
    } catch (err) {
      console.error('Gemini error:', err);
      return res.status(500).json({ msg: 'Portfolio analysis failed' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Helper function to extract resume content
function extractResumeContent(resume) {
  const { personalInfo, workExperience, education, skills } = resume;
  
  let content = `Name: ${personalInfo.name}\nEmail: ${personalInfo.email}\n`;
  
  if (personalInfo.summary) {
    content += `Summary: ${personalInfo.summary}\n`;
  }
  
  content += '\nWork Experience:\n';
  workExperience.forEach(exp => {
    content += `- ${exp.position} at ${exp.company}`;
    if (exp.location) content += `, ${exp.location}`;
    content += '\n';
    if (exp.description) content += `  Description: ${exp.description}\n`;
    if (exp.achievements && exp.achievements.length > 0) {
      content += '  Achievements:\n';
      exp.achievements.forEach(achievement => {
        content += `  - ${achievement}\n`;
      });
    }
  });
  
  content += '\nEducation:\n';
  education.forEach(edu => {
    content += `- ${edu.degree} in ${edu.fieldOfStudy || 'N/A'} from ${edu.institution}`;
    if (edu.location) content += `, ${edu.location}`;
    content += '\n';
  });
  
  content += '\nSkills:\n';
  skills.forEach(skill => {
    content += `- ${skill.name} (${skill.level})\n`;
  });
  
  return content;
}

// Helper function to match resume to jobs with OpenAI
async function matchResumeToJobsWithOpenAI(resumeContent, jobs, limit) {
  const jobsContent = jobs.map(job => ({
    id: job._id.toString(),
    title: job.title,
    company: job.company,
    description: job.description,
    requirements: job.requirements,
    skills: job.skills ? job.skills.join(', ') : '',
  }));

  const prompt = `I have a resume and a list of jobs. Please analyze the resume and match it with the most suitable jobs. 
  Return a JSON array of objects with the following properties: 
  - jobId: the ID of the job
  - matchScore: a number between 0 and 100 indicating how well the resume matches the job
  - reasons: an array of strings explaining why the resume matches or doesn't match the job
  - missingSkills: an array of strings listing skills mentioned in the job that are missing from the resume
  
  Only include the top ${limit} matches with the highest match scores.
  
  Resume:\n${resumeContent}\n\nJobs:\n${JSON.stringify(jobsContent)}`;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are an expert job matcher that analyzes resumes and job descriptions to find the best matches." },
      { role: "user", content: prompt }
    ],
    max_tokens: 2000,
    temperature: 0.5,
  });

  try {
    const content = response.choices[0].message.content.trim();
    return JSON.parse(content);
  } catch (err) {
    console.error('Error parsing OpenAI response:', err);
    throw new Error('Failed to parse AI response');
  }
}

// Helper function to match resume to jobs with Gemini
async function matchResumeToJobsWithGemini(resumeContent, jobs, limit) {
  const jobsContent = jobs.map(job => ({
    id: job._id.toString(),
    title: job.title,
    company: job.company,
    description: job.description,
    requirements: job.requirements,
    skills: job.skills ? job.skills.join(', ') : '',
  }));

  const prompt = `I have a resume and a list of jobs. Please analyze the resume and match it with the most suitable jobs. 
  Return a JSON array of objects with the following properties: 
  - jobId: the ID of the job
  - matchScore: a number between 0 and 100 indicating how well the resume matches the job
  - reasons: an array of strings explaining why the resume matches or doesn't match the job
  - missingSkills: an array of strings listing skills mentioned in the job that are missing from the resume
  
  Only include the top ${limit} matches with the highest match scores.
  
  Resume:\n${resumeContent}\n\nJobs:\n${JSON.stringify(jobsContent)}`;

  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const content = response.text();

  try {
    // Extract JSON from the response (Gemini might wrap it in markdown code blocks)
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```([\s\S]*?)```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : content;
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error('Error parsing Gemini response:', err);
    throw new Error('Failed to parse AI response');
  }
}

// Helper function to match job to resumes with OpenAI
async function matchJobToResumesWithOpenAI(jobContent, resumes) {
  const resumesContent = resumes.map(resume => ({
    id: resume._id.toString(),
    content: extractResumeContent(resume)
  }));

  const prompt = `I have a job description and a list of resumes. Please analyze the job and match it with the most suitable resumes. 
  Return a JSON array of objects with the following properties: 
  - resumeId: the ID of the resume
  - matchScore: a number between 0 and 100 indicating how well the job matches the resume
  - reasons: an array of strings explaining why the job matches or doesn't match the resume
  - missingSkills: an array of strings listing skills mentioned in the job that are missing from the resume
  
  Job:\n${jobContent}\n\nResumes:\n${JSON.stringify(resumesContent)}`;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are an expert job matcher that analyzes resumes and job descriptions to find the best matches." },
      { role: "user", content: prompt }
    ],
    max_tokens: 2000,
    temperature: 0.5,
  });

  try {
    const content = response.choices[0].message.content.trim();
    return JSON.parse(content);
  } catch (err) {
    console.error('Error parsing OpenAI response:', err);
    throw new Error('Failed to parse AI response');
  }
}

// Helper function to match job to resumes with Gemini
async function matchJobToResumesWithGemini(jobContent, resumes) {
  const resumesContent = resumes.map(resume => ({
    id: resume._id.toString(),
    content: extractResumeContent(resume)
  }));

  const prompt = `I have a job description and a list of resumes. Please analyze the job and match it with the most suitable resumes. 
  Return a JSON array of objects with the following properties: 
  - resumeId: the ID of the resume
  - matchScore: a number between 0 and 100 indicating how well the job matches the resume
  - reasons: an array of strings explaining why the job matches or doesn't match the resume
  - missingSkills: an array of strings listing skills mentioned in the job that are missing from the resume
  
  Job:\n${jobContent}\n\nResumes:\n${JSON.stringify(resumesContent)}`;

  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const content = response.text();

  try {
    // Extract JSON from the response (Gemini might wrap it in markdown code blocks)
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```([\s\S]*?)```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : content;
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error('Error parsing Gemini response:', err);
    throw new Error('Failed to parse AI response');
  }
}

// Helper function to optimize resume for job with OpenAI
async function optimizeResumeForJobWithOpenAI(resumeContent, jobContent) {
  const prompt = `I have a resume and a job description. Please optimize the resume to better match the job requirements.
  Return a JSON object with the following properties:
  - summary: a string with an optimized professional summary
  - skills: an array of strings with recommended skills to highlight
  - experience: an array of strings with recommended improvements to work experience descriptions
  - education: an array of strings with recommended improvements to education section
  - keywords: an array of strings with important keywords from the job description to include
  - generalTips: an array of strings with general tips for improving the resume
  
  Resume:\n${resumeContent}\n\nJob Description:\n${jobContent}`;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are an expert resume optimizer that helps job seekers tailor their resumes to specific job descriptions." },
      { role: "user", content: prompt }
    ],
    max_tokens: 2000,
    temperature: 0.5,
  });

  try {
    const content = response.choices[0].message.content.trim();
    return JSON.parse(content);
  } catch (err) {
    console.error('Error parsing OpenAI response:', err);
    throw new Error('Failed to parse AI response');
  }
}

// Helper function to optimize resume for job with Gemini
async function optimizeResumeForJobWithGemini(resumeContent, jobContent) {
  const prompt = `I have a resume and a job description. Please optimize the resume to better match the job requirements.
  Return a JSON object with the following properties:
  - summary: a string with an optimized professional summary
  - skills: an array of strings with recommended skills to highlight
  - experience: an array of strings with recommended improvements to work experience descriptions
  - education: an array of strings with recommended improvements to education section
  - keywords: an array of strings with important keywords from the job description to include
  - generalTips: an array of strings with general tips for improving the resume
  
  Resume:\n${resumeContent}\n\nJob Description:\n${jobContent}`;

  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const content = response.text();

  try {
    // Extract JSON from the response (Gemini might wrap it in markdown code blocks)
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```([\s\S]*?)```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : content;
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error('Error parsing Gemini response:', err);
    throw new Error('Failed to parse AI response');
  }
}

// Helper function to analyze portfolio with Gemini
async function analyzePortfolioWithGemini(portfolioUrls, jobContent) {
  // Create parts array for multimodal content
  const parts = [];
  
  // Add text prompt
  let promptText = "Analyze the following portfolio images and provide feedback.";
  if (jobContent) {
    promptText += " Also evaluate how well they match the following job description:\n" + jobContent;
  }
  parts.push({ text: promptText });
  
  // Add image parts (up to 10 images)
  const imagesToProcess = portfolioUrls.slice(0, 10); // Limit to 10 images
  for (const url of imagesToProcess) {
    try {
      // Fetch the image data
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const mimeType = response.headers['content-type'];
      const imageData = Buffer.from(response.data).toString('base64');
      
      parts.push({
        inlineData: {
          data: imageData,
          mimeType
        }
      });
    } catch (err) {
      console.error(`Error fetching image from ${url}:`, err);
      // Continue with other images if one fails
    }
  }
  
  // Use Gemini Pro Vision for multimodal analysis
  const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
  
  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts }]
    });
    const response = await result.response;
    const content = response.text();
    
    // Structure the response
    return {
      analysis: content,
      portfolioCount: imagesToProcess.length
    };
  } catch (err) {
    console.error('Error analyzing portfolio with Gemini:', err);
    throw new Error('Failed to analyze portfolio images');
  }
}

export default router;