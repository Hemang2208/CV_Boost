import { useState } from 'react';
import ApplicationsTable from './ApplicationsTable';

const DashboardTabs = ({ children }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'applications', label: 'Applications' },
    { id: 'insights', label: 'Insights & Suggestions' }
  ];

  return (
    <div>
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div>
        {activeTab === 'overview' && (
          <div>{children}</div>
        )}
        
        {activeTab === 'applications' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Job Applications</h2>
            <ApplicationsTable />
          </div>
        )}
        
        {activeTab === 'insights' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Insights & Suggestions</h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-lg mb-4">
                Based on your application history and resume performance, here are personalized insights to help improve your job search success:
              </p>
              
              {/* This will be the suggestions section from the main dashboard */}
              <div className="mt-6">
                {children.props.children.filter(child => 
                  child?.props?.children?.[0]?.props?.children === 'Personalized Suggestions'
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardTabs;