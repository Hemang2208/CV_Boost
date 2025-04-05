import React from 'react';

const ApplicationStatusFilter = ({ selectedStatus, onStatusChange }) => {
  const statuses = [
    { value: 'all', label: 'All Applications' },
    { value: 'Applied', label: 'Applied' },
    { value: 'Viewed', label: 'Viewed' },
    { value: 'Interview', label: 'Interview' },
    { value: 'Offer', label: 'Offer' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Withdrawn', label: 'Withdrawn' }
  ];

  return (
    <div className="mb-4">
      <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
        Filter by Status
      </label>
      <select
        id="status-filter"
        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        value={selectedStatus}
        onChange={(e) => onStatusChange(e.target.value)}
      >
        {statuses.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ApplicationStatusFilter;