import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ResumeList = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/resumes');
        setResumes(res.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to load resumes');
        setLoading(false);
      }
    };

    fetchResumes();
  }, []);

  const handleDeleteResume = async (id) => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      try {
        await axios.delete(`/api/resumes/${id}`);
        setResumes(resumes.filter(resume => resume._id !== id));
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to delete resume');
      }
    }
  };

  if (loading) return <div className="container mx-auto p-4"><div className="text-center">Loading resumes...</div></div>;

  if (error) return <div className="container mx-auto p-4"><div className="text-red-500">{error}</div></div>;

  const handleFileChange = (e) => {
  setSelectedFile(e.target.files[0]);
};

const handleFileUpload = async () => {
  if (!selectedFile) return;
  
  const formData = new FormData();
  formData.append('resume', selectedFile);
  
  try {
    setUploading(true);
    const res = await axios.post('/api/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    setResumes([...resumes, res.data]);
    setSelectedFile(null);
    setUploadError(null);
  } catch (err) {
    setUploadError(err.response?.data?.msg || 'Failed to upload resume');
  } finally {
    setUploading(false);
  }
};

return (
  <div className="container mx-auto p-4">
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">My Resumes</h1>
      <Link 
        to="/resumes/new" 
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Create New Resume
      </Link>
    </div>
    
    <div className="flex flex-col md:flex-row gap-8">
      {/* Left Panel - Resume List */}
      <div className="md:w-1/2">
        {resumes.length === 0 ? (
          <div className="text-center p-8 bg-gray-100 rounded-lg">
            <p className="text-lg mb-4">You haven't created any resumes yet.</p>
            <Link 
              to="/resumes/new" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Create Your First Resume
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {resumes.map(resume => (
              <div key={resume._id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 mb-2">{resume.title || 'Untitled Resume'}</h2>
                
                <div className="text-sm text-gray-500 mb-4">
                  <p>Last updated: {new Date(resume.updatedAt).toLocaleDateString()}</p>
                  <p>Created: {new Date(resume.createdAt).toLocaleDateString()}</p>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-md font-semibold mb-1">Skills</h3>
                  <div className="flex flex-wrap gap-1">
                    {resume.skills && resume.skills.length > 0 ? (
                      resume.skills.slice(0, 5).map((skill, index) => (
                        <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm">No skills listed</span>
                    )}
                    {resume.skills && resume.skills.length > 5 && (
                      <span className="text-gray-500 text-xs">+{resume.skills.length - 5} more</span>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2 mt-4">
                  <Link 
                    to={`/resume-optimizer/${resume._id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-3 rounded flex-1 text-center"
                  >
                    Optimize
                  </Link>
                  <Link 
                    to={`/resumes/edit/${resume._id}`}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-bold py-2 px-3 rounded flex-1 text-center"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteResume(resume._id)}
                    className="bg-red-100 hover:bg-red-200 text-red-700 text-sm font-bold py-2 px-3 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Right Panel - Upload/Edit */}
      <div className="md:w-1/2">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-bold mb-4">Upload or Edit Resume</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="resumeUpload">
                Upload Resume File
              </label>
              <input
                type="file"
                id="resumeUpload"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                className="w-full px-3 py-2 border rounded-lg"
              />
              {selectedFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {selectedFile.name}
                </p>
              )}
              <button
                onClick={handleFileUpload}
                disabled={!selectedFile || uploading}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload Resume'}
              </button>
              {uploadError && (
                <p className="mt-2 text-sm text-red-500">{uploadError}</p>
              )}
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-2">Or create a new resume</h3>
              <Link 
                to="/resumes/new" 
                className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
              >
                Start from Scratch
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}

export default ResumeList;