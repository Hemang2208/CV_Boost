import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    jobType: '',
    experienceLevel: ''
  });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/jobs');
        setJobs(res.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to load jobs');
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const filteredJobs = jobs.filter(job => {
    // Search term filter
    const matchesSearch = searchTerm === '' || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Location filter
    const matchesLocation = filters.location === '' || 
      job.location.toLowerCase().includes(filters.location.toLowerCase());
    
    // Job type filter
    const matchesJobType = filters.jobType === '' || 
      job.jobType === filters.jobType;
    
    // Experience level filter
    const matchesExperience = filters.experienceLevel === '' || 
      job.experienceLevel === filters.experienceLevel;
    
    return matchesSearch && matchesLocation && matchesJobType && matchesExperience;
  });

  if (loading) return <div className="container mx-auto p-4"><div className="text-center">Loading jobs...</div></div>;

  if (error) return <div className="container mx-auto p-4"><div className="text-red-500">{error}</div></div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Job Listings</h1>
      
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search jobs by title, company, or keywords"
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Location</label>
            <input
              type="text"
              name="location"
              placeholder="Any location"
              value={filters.location}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Job Type</label>
            <select
              name="jobType"
              value={filters.jobType}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Freelance">Freelance</option>
              <option value="Internship">Internship</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Experience Level</label>
            <select
              name="experienceLevel"
              value={filters.experienceLevel}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">All Levels</option>
              <option value="Entry">Entry Level</option>
              <option value="Mid">Mid Level</option>
              <option value="Senior">Senior Level</option>
              <option value="Executive">Executive</option>
            </select>
          </div>
        </div>
      </div>
      
      {filteredJobs.length === 0 ? (
        <div className="text-center p-8 bg-gray-100 rounded-lg">
          <p className="text-lg">No jobs match your search criteria.</p>
          <button 
            onClick={() => {
              setSearchTerm('');
              setFilters({ location: '', jobType: '', experienceLevel: '' });
            }}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredJobs.map(job => (
            <div key={job._id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{job.title}</h2>
                  <p className="text-gray-600 mt-1">{job.company} • {job.location}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{job.jobType}</span>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">{job.experienceLevel} Level</span>
                    {job.salary && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                        {typeof job.salary === 'object' 
                          ? `$${job.salary.min.toLocaleString()} - $${job.salary.max.toLocaleString()}` 
                          : `$${job.salary.toLocaleString()}`}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 mt-4 line-clamp-3">{job.description}</p>
                </div>
                <div className="ml-4">
                  <Link 
                    to={`/resume-optimizer/${job._id}`} 
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                  >
                    Apply Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobList;