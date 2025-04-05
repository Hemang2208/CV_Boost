import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ApplicationList = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch applications
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/applications');
        setApplications(response.data);
        setFilteredApplications(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load applications');
        console.error(err);
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // Filter applications by status
  useEffect(() => {
    if (statusFilter === 'All') {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(applications.filter(app => app.status === statusFilter));
    }
  }, [statusFilter, applications]);

  // Update application status
  const updateApplicationStatus = async (id, newStatus) => {
    try {
      await axios.put(`/api/applications/${id}`, { status: newStatus });
      
      // Update applications state
      setApplications(applications.map(app => 
        app._id === id ? { ...app, status: newStatus } : app
      ));

      // Track application response time if status is changing to a response status
      if (['Viewed', 'Interview', 'Offer', 'Rejected'].includes(newStatus)) {
        const application = applications.find(app => app._id === id);
        if (application) {
          const appliedDate = new Date(application.appliedDate);
          const responseTime = Math.floor((new Date() - appliedDate) / (1000 * 60 * 60 * 24)); // in days
          
          await axios.post('/api/analytics/track-application-response', {
            applicationId: id,
            status: newStatus,
            responseTime
          });
        }
      }
    } catch (err) {
      setError('Failed to update application status');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center p-5">Loading applications...</div>;
  }

  if (error) {
    return <div className="text-center p-5 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Job Applications</h1>
        <Link to="/analytics" className="bg-blue-500 text-white px-4 py-2 rounded">
          View Analytics Dashboard
        </Link>
      </div>
      
      {/* Filter Controls */}
      <div className="mb-6">
        <label className="mr-2 font-semibold">Filter by Status:</label>
        <select 
          className="border rounded p-2"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Applications</option>
          <option value="Applied">Applied</option>
          <option value="Viewed">Viewed</option>
          <option value="Interview">Interview</option>
          <option value="Offer">Offer</option>
          <option value="Rejected">Rejected</option>
          <option value="Withdrawn">Withdrawn</option>
        </select>
      </div>
      
      {/* Applications Table */}
      {filteredApplications.length === 0 ? (
        <div className="text-center p-5 bg-gray-100 rounded">
          No applications found with the selected filter.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">Job Title</th>
                <th className="py-3 px-4 text-left">Company</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Applied Date</th>
                <th className="py-3 px-4 text-left">Resume</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((application) => (
                <tr key={application._id} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4">{application.job?.title || 'N/A'}</td>
                  <td className="py-3 px-4">{application.job?.company || 'N/A'}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-1 rounded text-sm ${
                      application.status === 'Applied' ? 'bg-blue-100 text-blue-800' :
                      application.status === 'Viewed' ? 'bg-purple-100 text-purple-800' :
                      application.status === 'Interview' ? 'bg-yellow-100 text-yellow-800' :
                      application.status === 'Offer' ? 'bg-green-100 text-green-800' :
                      application.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {application.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">{new Date(application.appliedDate).toLocaleDateString()}</td>
                  <td className="py-3 px-4">{application.resume?.personalInfo?.name || 'N/A'}</td>
                  <td className="py-3 px-4">
                    <select
                      className="border rounded p-1"
                      value={application.status}
                      onChange={(e) => updateApplicationStatus(application._id, e.target.value)}
                    >
                      <option value="Applied">Applied</option>
                      <option value="Viewed">Viewed</option>
                      <option value="Interview">Interview</option>
                      <option value="Offer">Offer</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Withdrawn">Withdrawn</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ApplicationList;