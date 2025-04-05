import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const ResumeOptimizer = () => {
  const { resumeId, jobId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [applying, setApplying] = useState(false);
  const [resume, setResume] = useState(null);
  const [job, setJob] = useState(null);
  const [optimization, setOptimization] = useState(null);
  const [error, setError] = useState(null);
  const [selectedSuggestions, setSelectedSuggestions] = useState({
    summary: false,
    skills: [],
    experience: [],
    education: []
  });

  // Fetch resume and job data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch resume data
        const resumeRes = await axios.get(`/api/resumes/${resumeId}`);
        setResume(resumeRes.data);
        
        // Fetch job data if jobId is provided
        if (jobId) {
          const jobRes = await axios.get(`/api/jobs/${jobId}`);
          setJob(jobRes.data);
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to load data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [resumeId, jobId]);

  // Function to get optimization suggestions
  const getOptimizationSuggestions = async () => {
    try {
      setOptimizing(true);
      setError(null);
      
      const res = await axios.post('/api/matching/optimize-resume', {
        resumeId,
        jobId
      });
      
      setOptimization(res.data);
      
      // Initialize selected suggestions
      setSelectedSuggestions({
        summary: false,
        skills: [],
        experience: [],
        education: []
      });
      
      setOptimizing(false);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to get optimization suggestions');
      setOptimizing(false);
    }
  };

  // Function to apply selected optimization suggestions
  const applyOptimizationSuggestions = async () => {
    try {
      setApplying(true);
      setError(null);
      
      // Prepare optimization data based on selected suggestions
      const optimizationData = {};
      
      // Add summary if selected
      if (selectedSuggestions.summary && optimization.summary) {
        optimizationData.summary = optimization.summary;
      }
      
      // Add selected skills
      if (selectedSuggestions.skills.length > 0 && optimization.skills) {
        optimizationData.skills = selectedSuggestions.skills.map(
          index => optimization.skills[index]
        );
      }
      
      // Add selected experience improvements
      if (selectedSuggestions.experience.length > 0 && optimization.experience) {
        optimizationData.experience = selectedSuggestions.experience.map(index => ({
          index,
          description: optimization.experience[index]
        }));
      }
      
      // Add selected education improvements
      if (selectedSuggestions.education.length > 0 && optimization.education) {
        optimizationData.education = selectedSuggestions.education.map(index => ({
          index,
          description: optimization.education[index]
        }));
      }
      
      // Add keywords
      if (optimization.keywords) {
        optimizationData.keywords = optimization.keywords;
      }
      
      // Apply optimization suggestions
      const res = await axios.post(`/api/resumes/apply-optimization/${resumeId}`, {
        optimizationData
      });
      
      // Update resume with optimized version
      setResume(res.data);
      
      // Clear optimization data
      setOptimization(null);
      
      setApplying(false);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to apply optimization suggestions');
      setApplying(false);
    }
  };

  // Toggle selection of a suggestion
  const toggleSummarySelection = () => {
    setSelectedSuggestions({
      ...selectedSuggestions,
      summary: !selectedSuggestions.summary
    });
  };

  const toggleSkillSelection = (index) => {
    const updatedSkills = [...selectedSuggestions.skills];
    const skillIndex = updatedSkills.indexOf(index);
    
    if (skillIndex === -1) {
      updatedSkills.push(index);
    } else {
      updatedSkills.splice(skillIndex, 1);
    }
    
    setSelectedSuggestions({
      ...selectedSuggestions,
      skills: updatedSkills
    });
  };

  const toggleExperienceSelection = (index) => {
    const updatedExperience = [...selectedSuggestions.experience];
    const expIndex = updatedExperience.indexOf(index);
    
    if (expIndex === -1) {
      updatedExperience.push(index);
    } else {
      updatedExperience.splice(expIndex, 1);
    }
    
    setSelectedSuggestions({
      ...selectedSuggestions,
      experience: updatedExperience
    });
  };

  const toggleEducationSelection = (index) => {
    const updatedEducation = [...selectedSuggestions.education];
    const eduIndex = updatedEducation.indexOf(index);
    
    if (eduIndex === -1) {
      updatedEducation.push(index);
    } else {
      updatedEducation.splice(eduIndex, 1);
    }
    
    setSelectedSuggestions({
      ...selectedSuggestions,
      education: updatedEducation
    });
  };

  if (loading) {
    return <div className="container mt-5"><div className="spinner-border" role="status"></div></div>;
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-primary" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2>Resume Optimizer</h2>
      
      {/* Resume and Job Information */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Your Resume</h5>
            </div>
            <div className="card-body">
              {resume && (
                <div>
                  <h4>{resume.personalInfo.name}</h4>
                  <p>{resume.personalInfo.email}</p>
                  {resume.personalInfo.summary && (
                    <div className="mb-3">
                      <h5>Summary</h5>
                      <p>{resume.personalInfo.summary}</p>
                    </div>
                  )}
                  
                  <h5>Skills</h5>
                  <ul className="list-group mb-3">
                    {resume.skills.map((skill, index) => (
                      <li key={index} className="list-group-item">
                        {skill.name} ({skill.level})
                      </li>
                    ))}
                  </ul>
                  
                  <h5>Experience</h5>
                  {resume.workExperience.map((exp, index) => (
                    <div key={index} className="mb-2">
                      <h6>{exp.position} at {exp.company}</h6>
                      <p className="text-muted">
                        {new Date(exp.startDate).toLocaleDateString()} - 
                        {exp.current ? 'Present' : new Date(exp.endDate).toLocaleDateString()}
                      </p>
                      <p>{exp.description}</p>
                      {exp.optimizedDescription && (
                        <div className="alert alert-success">
                          <strong>Optimized:</strong> {exp.optimizedDescription}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">Job Details</h5>
            </div>
            <div className="card-body">
              {job ? (
                <div>
                  <h4>{job.title}</h4>
                  <h5>{job.company}</h5>
                  {job.location && <p><strong>Location:</strong> {job.location}</p>}
                  
                  <div className="mb-3">
                    <h5>Description</h5>
                    <p>{job.description}</p>
                  </div>
                  
                  <div className="mb-3">
                    <h5>Requirements</h5>
                    <p>{job.requirements}</p>
                  </div>
                  
                  {job.skills && job.skills.length > 0 && (
                    <div className="mb-3">
                      <h5>Skills</h5>
                      <ul className="list-group">
                        {job.skills.map((skill, index) => (
                          <li key={index} className="list-group-item">{skill}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="alert alert-warning">
                  No job selected. For best results, please select a job to optimize your resume for.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Optimization Controls */}
      <div className="row mb-4">
        <div className="col-12">
          {!optimization ? (
            <button 
              className="btn btn-primary btn-lg" 
              onClick={getOptimizationSuggestions}
              disabled={optimizing || !jobId}
            >
              {optimizing ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Optimizing...
                </>
              ) : (
                'Get Optimization Suggestions'
              )}
            </button>
          ) : (
            <button 
              className="btn btn-success btn-lg" 
              onClick={applyOptimizationSuggestions}
              disabled={applying || (
                !selectedSuggestions.summary && 
                selectedSuggestions.skills.length === 0 && 
                selectedSuggestions.experience.length === 0 && 
                selectedSuggestions.education.length === 0
              )}
            >
              {applying ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Applying Changes...
                </>
              ) : (
                'Apply Selected Changes'
              )}
            </button>
          )}
          
          {optimization && (
            <button 
              className="btn btn-outline-secondary btn-lg ml-2" 
              onClick={() => setOptimization(null)}
              disabled={applying}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
      
      {/* Optimization Suggestions */}
      {optimization && (
        <div className="row">
          <div className="col-12">
            <div className="card mb-4">
              <div className="card-header bg-success text-white">
                <h4 className="mb-0">AI Optimization Suggestions</h4>
              </div>
              <div className="card-body">
                <div className="alert alert-info">
                  <i className="fas fa-info-circle"></i> Select the suggestions you want to apply to your resume.
                </div>
                
                {/* Summary Suggestions */}
                {optimization.summary && (
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5>Optimized Summary</h5>
                      <div className="form-check form-switch">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          id="summarySwitch"
                          checked={selectedSuggestions.summary}
                          onChange={toggleSummarySelection}
                        />
                        <label className="form-check-label" htmlFor="summarySwitch">
                          {selectedSuggestions.summary ? 'Selected' : 'Select'}
                        </label>
                      </div>
                    </div>
                    <div className={`card ${selectedSuggestions.summary ? 'border-success' : ''}`}>
                      <div className="card-body">
                        <p>{optimization.summary}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Skills Suggestions */}
                {optimization.skills && optimization.skills.length > 0 && (
                  <div className="mb-4">
                    <h5>Recommended Skills</h5>
                    <div className="row">
                      {optimization.skills.map((skill, index) => (
                        <div key={index} className="col-md-4 mb-2">
                          <div 
                            className={`card ${selectedSuggestions.skills.includes(index) ? 'border-success' : ''}`}
                            onClick={() => toggleSkillSelection(index)}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="card-body py-2">
                              <div className="d-flex justify-content-between align-items-center">
                                <span>{skill}</span>
                                <div className="form-check">
                                  <input 
                                    className="form-check-input" 
                                    type="checkbox" 
                                    checked={selectedSuggestions.skills.includes(index)}
                                    onChange={() => {}} // Handled by the card click
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Experience Suggestions */}
                {optimization.experience && optimization.experience.length > 0 && (
                  <div className="mb-4">
                    <h5>Experience Improvements</h5>
                    {optimization.experience.map((suggestion, index) => (
                      <div key={index} className="mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <h6>
                            {resume.workExperience[index] ? 
                              `${resume.workExperience[index].position} at ${resume.workExperience[index].company}` : 
                              `Experience ${index + 1}`}
                          </h6>
                          <div className="form-check form-switch">
                            <input 
                              className="form-check-input" 
                              type="checkbox" 
                              id={`expSwitch${index}`}
                              checked={selectedSuggestions.experience.includes(index)}
                              onChange={() => toggleExperienceSelection(index)}
                            />
                            <label className="form-check-label" htmlFor={`expSwitch${index}`}>
                              {selectedSuggestions.experience.includes(index) ? 'Selected' : 'Select'}
                            </label>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-6">
                            <div className="card bg-light">
                              <div className="card-body">
                                <h6 className="card-subtitle mb-2 text-muted">Original</h6>
                                <p>{resume.workExperience[index]?.description || 'No description'}</p>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className={`card ${selectedSuggestions.experience.includes(index) ? 'border-success' : ''}`}>
                              <div className="card-body">
                                <h6 className="card-subtitle mb-2 text-muted">Optimized</h6>
                                <p>{suggestion}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Education Suggestions */}
                {optimization.education && optimization.education.length > 0 && (
                  <div className="mb-4">
                    <h5>Education Improvements</h5>
                    {optimization.education.map((suggestion, index) => (
                      <div key={index} className="mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <h6>
                            {resume.education[index] ? 
                              `${resume.education[index].degree} from ${resume.education[index].institution}` : 
                              `Education ${index + 1}`}
                          </h6>
                          <div className="form-check form-switch">
                            <input 
                              className="form-check-input" 
                              type="checkbox" 
                              id={`eduSwitch${index}`}
                              checked={selectedSuggestions.education.includes(index)}
                              onChange={() => toggleEducationSelection(index)}
                            />
                            <label className="form-check-label" htmlFor={`eduSwitch${index}`}>
                              {selectedSuggestions.education.includes(index) ? 'Selected' : 'Select'}
                            </label>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-6">
                            <div className="card bg-light">
                              <div className="card-body">
                                <h6 className="card-subtitle mb-2 text-muted">Original</h6>
                                <p>{resume.education[index]?.description || 'No description'}</p>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className={`card ${selectedSuggestions.education.includes(index) ? 'border-success' : ''}`}>
                              <div className="card-body">
                                <h6 className="card-subtitle mb-2 text-muted">Optimized</h6>
                                <p>{suggestion}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Keywords */}
                {optimization.keywords && optimization.keywords.length > 0 && (
                  <div className="mb-4">
                    <h5>Important Keywords</h5>
                    <p className="text-muted">These keywords will be stored with your resume to help with future optimizations.</p>
                    <div className="d-flex flex-wrap">
                      {optimization.keywords.map((keyword, index) => (
                        <span key={index} className="badge bg-info text-white m-1 p-2">{keyword}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* General Tips */}
                {optimization.generalTips && optimization.generalTips.length > 0 && (
                  <div className="mb-4">
                    <h5>General Tips</h5>
                    <ul className="list-group">
                      {optimization.generalTips.map((tip, index) => (
                        <li key={index} className="list-group-item">{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeOptimizer;