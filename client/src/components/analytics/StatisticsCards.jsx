import React from 'react';

const StatisticsCards = ({ analyticsData }) => {
  if (!analyticsData) return null;
  
  const { applicationStats, resumeViews } = analyticsData;
  
  // Calculate rates
  const interviewRate = applicationStats.totalApplications 
    ? Math.round((applicationStats.interviews / applicationStats.totalApplications) * 100)
    : 0;
    
  const offerRate = applicationStats.totalApplications 
    ? Math.round((applicationStats.offers / applicationStats.totalApplications) * 100)
    : 0;
    
  const rejectionRate = applicationStats.totalApplications 
    ? Math.round((applicationStats.rejections / applicationStats.totalApplications) * 100)
    : 0;
  
  const cards = [
    {
      title: 'Total Applications',
      value: applicationStats.totalApplications || 0,
      icon: '📝',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      title: 'Resume Views',
      value: resumeViews || 0,
      icon: '👁️',
      color: 'bg-green-100 text-green-800'
    },
    {
      title: 'Interview Rate',
      value: `${interviewRate}%`,
      icon: '🗣️',
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      title: 'Offer Rate',
      value: `${offerRate}%`,
      icon: '🎯',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      title: 'Rejection Rate',
      value: `${rejectionRate}%`,
      icon: '❌',
      color: 'bg-red-100 text-red-800'
    },
    {
      title: 'Pending Applications',
      value: applicationStats.pending || 0,
      icon: '⏳',
      color: 'bg-indigo-100 text-indigo-800'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {cards.map((card, index) => (
        <div key={index} className={`${card.color} p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">{card.title}</h3>
              <p className="text-2xl font-bold mt-1">{card.value}</p>
            </div>
            <div className="text-2xl">{card.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatisticsCards;