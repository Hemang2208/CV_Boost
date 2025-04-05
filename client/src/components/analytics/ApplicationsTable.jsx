import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ApplicationStatusFilter from './ApplicationStatusFilter';

const ApplicationsTable = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoize the fetch function to prevent unnecessary re-renders
  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/applications');
      setApplications(response.data);
      setFilteredApplications(response.data);
    } catch (err) {
      console.error('Error fetching applications:', err.message);
      setError(
        err.response?.data?.msg || 
        'Failed to load applications. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    if (selectedStatus === 'all') {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(applications.filter(app => app.status === selectedStatus));
    }
  }, [selectedStatus, applications]);

  // Memoize the status change handler to prevent unnecessary re-renders
  const handleStatusChange = useCallback(async (applicationId, newStatus) => {
    try {
      await axios.put(`/api/applications/${applicationId}`, { status: newStatus });
      
      // Update local state
      setApplications(prevApplications => 
        prevApplications.map(app => 
          app._id === applicationId ? { ...app, status: newStatus } : app
        )
      );
    } catch (err) {
      console.error('Failed to update application status:', err.message);
      // Show error to user
      alert(err.response?.data?.msg || 'Failed to update application status. Please try again.');
    }
  }, []);

  if (loading) {
    return <div className="text-center p-5">Loading applications...</div>;
  }

  if (error) {
    return <div className="text-center p-5 text-red-500">{error}</div>;
  }

  if (applications.length === 0) {
    return <div className="text-center p-5">No applications found. Start applying to jobs to track your progress!</div>;
  }

  return (
    <div>
      <ApplicationStatusFilter 
        selectedStatus={selectedStatus} 
        onStatusChange={setSelectedStatus} 
      />
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resume</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredApplications.map((application) => (
              <tr key={application._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{application.job.title}</td>
                <td className="px-6 py-4 whitespace-nowrap">{application.job.company}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(application.appliedDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {application.resume ? application.resume.personalInfo.name : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <select
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                    value={application.status}
                    onChange={(e) => handleStatusChange(application._id, e.target.value)}
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
    </div>
  );
};

export default ApplicationsTable;