import express from 'express';
const router = express.Router();
import auth from '../../middleware/auth.js';
import { OpenAI } from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Initialize Google Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @route   POST api/ai/optimize-experience
// @desc    Optimize work experience descriptions
// @access  Private
router.post('/optimize-experience', auth, async (req, res) => {
  try {
    const { jobTitle, companyName, description, jobIndustry } = req.body;

    if (!description) {
      return res.status(400).json({ msg: 'Description is required' });
    }

    // Choose AI model based on availability or preference
    // Default to OpenAI, fallback to Gemini if OpenAI fails
    try {
      const optimizedContent = await optimizeWithOpenAI(jobTitle, companyName, description, jobIndustry);
      return res.json({ optimizedContent });
    } catch (openaiError) {
      console.error('OpenAI error:', openaiError);
      try {
        const optimizedContent = await optimizeWithGemini(jobTitle, companyName, description, jobIndustry);
        return res.json({ optimizedContent });
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

// @route   POST api/ai/suggest-skills
// @desc    Suggest skills based on job title and resume content
// @access  Private
router.post('/suggest-skills', auth, async (req, res) => {
  try {
    const { jobTitle, resumeContent, industry } = req.body;

    if (!jobTitle) {
      return res.status(400).json({ msg: 'Job title is required' });
    }

    // Choose AI model based on availability or preference
    try {
      const suggestedSkills = await suggestSkillsWithOpenAI(jobTitle, resumeContent, industry);
      return res.json({ suggestedSkills });
    } catch (openaiError) {
      console.error('OpenAI error:', openaiError);
      try {
        const suggestedSkills = await suggestSkillsWithGemini(jobTitle, resumeContent, industry);
        return res.json({ suggestedSkills });
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

// Helper function to optimize experience with OpenAI
async function optimizeWithOpenAI(jobTitle, companyName, description, jobIndustry) {
  const prompt = `Optimize the following work experience description for a resume. 
  Make it ATS-friendly, use strong action verbs, quantify achievements where possible, 
  and keep it concise but impactful. Ensure it's relevant for a ${jobTitle} position at ${companyName} 
  in the ${jobIndustry || 'technology'} industry.\n\nOriginal description: ${description}`;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are an expert resume writer who specializes in creating impactful, ATS-friendly work experience descriptions." },
      { role: "user", content: prompt }
    ],
    max_tokens: 500,
    temperature: 0.7,
  });

  return response.choices[0].message.content.trim();
}

// Helper function to optimize experience with Gemini
async function optimizeWithGemini(jobTitle, companyName, description, jobIndustry) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const prompt = `Optimize the following work experience description for a resume. 
  Make it ATS-friendly, use strong action verbs, quantify achievements where possible, 
  and keep it concise but impactful. Ensure it's relevant for a ${jobTitle} position at ${companyName} 
  in the ${jobIndustry || 'technology'} industry.\n\nOriginal description: ${description}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

// Helper function to suggest skills with OpenAI
async function suggestSkillsWithOpenAI(jobTitle, resumeContent, industry) {
  const prompt = `Based on the job title "${jobTitle}" in the ${industry || 'technology'} industry, 
  suggest 10-15 relevant technical and soft skills that would make a resume stand out to recruiters and pass ATS systems. 
  ${resumeContent ? `Here's the current resume content to consider: ${resumeContent}` : ''}`;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are an expert in job requirements and skills for various industries. Provide relevant skills for job seekers." },
      { role: "user", content: prompt }
    ],
    max_tokens: 500,
    temperature: 0.7,
  });

  const content = response.choices[0].message.content.trim();
  
  // Parse the response to extract skills as an array
  const skillsArray = parseSkillsFromAIResponse(content);
  return skillsArray;
}

// Helper function to suggest skills with Gemini
async function suggestSkillsWithGemini(jobTitle, resumeContent, industry) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const prompt = `Based on the job title "${jobTitle}" in the ${industry || 'technology'} industry, 
  suggest 10-15 relevant technical and soft skills that would make a resume stand out to recruiters and pass ATS systems. 
  Return the skills as a numbered list. 
  ${resumeContent ? `Here's the current resume content to consider: ${resumeContent}` : ''}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const content = response.text();
  
  // Parse the response to extract skills as an array
  const skillsArray = parseSkillsFromAIResponse(content);
  return skillsArray;
}

// Helper function to parse skills from AI response
function parseSkillsFromAIResponse(content) {
  // Split by newlines and look for list items
  const lines = content.split('\n');
  const skills = [];
  
  // Regular expressions to match different list formats
  const listItemRegex = /^\s*(?:[\-\*•]|\d+[\.\)]|[a-z][\.\)]|[A-Z][\.\)]|\(\d+\)|\([a-z]\)|\([A-Z]\))\s+(.+)$/;
  
  for (const line of lines) {
    const match = line.match(listItemRegex);
    if (match) {
      skills.push(match[1].trim());
    } else if (line.trim() && !line.includes(':') && skills.length > 0) {
      // If it's not a list item but not empty and not a header, it might be a continuation
      skills[skills.length - 1] += ' ' + line.trim();
    }
  }
  
  // If no skills were found with the regex, try to extract any words that look like skills
  if (skills.length === 0) {
    const skillWords = content.match(/\b[A-Z][a-zA-Z]*(?:\s+[A-Z][a-zA-Z]*)*\b/g);
    if (skillWords) {
      return skillWords.filter(word => word.length > 2);
    }
    
    // Last resort: just split by commas or semicolons
    return content.split(/[,;]/).map(s => s.trim()).filter(s => s.length > 0);
  }
  
  return skills;
}

export default router;