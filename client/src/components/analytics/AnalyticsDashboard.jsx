import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';

// Import custom components
import StatisticsCards from './StatisticsCards';
import SuggestionsList from './SuggestionsList';
import ResponseTimeChart from './ResponseTimeChart';
import JobMatchChart from './JobMatchChart';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

// Import DashboardTabs
import DashboardTabs from './DashboardTabs';

const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [summaryPeriod, setSummaryPeriod] = useState('weekly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/analytics/dashboard');
        setAnalyticsData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load analytics data');
        console.error(err);
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  // Fetch suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await axios.get('/api/analytics/suggestions');
        setSuggestions(response.data);
      } catch (err) {
        console.error('Failed to load suggestions:', err);
      }
    };

    fetchSuggestions();
  }, []);

  // Fetch summaries
  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        const response = await axios.get(`/api/analytics/applications/summary?period=${summaryPeriod}`);
        setSummaries(response.data);
      } catch (err) {
        console.error(`Failed to load ${summaryPeriod} summaries:`, err);
      }
    };

    fetchSummaries();
  }, [summaryPeriod]);

  // Generate insights
  const generateInsights = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/analytics/generate-insights');
      setSuggestions(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to generate insights');
      console.error(err);
      setLoading(false);
    }
  };

  // Mark suggestion as read
  const markSuggestionAsRead = async (suggestionId) => {
    try {
      await axios.put(`/api/analytics/suggestions/${suggestionId}`);
      setSuggestions(suggestions.filter(suggestion => suggestion._id !== suggestionId));
    } catch (err) {
      console.error('Failed to mark suggestion as read:', err);
    }
  };

  // Update weekly summary
  const updateWeeklySummary = async () => {
    try {
      setLoading(true);
      await axios.post('/api/analytics/update-weekly-summary');
      // Refresh summaries
      const response = await axios.get(`/api/analytics/applications/summary?period=weekly`);
      setSummaries(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to update weekly summary');
      console.error(err);
      setLoading(false);
    }
  };

  // Update monthly summary
  const updateMonthlySummary = async () => {
    try {
      setLoading(true);
      await axios.post('/api/analytics/update-monthly-summary');
      // Refresh summaries
      const response = await axios.get(`/api/analytics/applications/summary?period=monthly`);
      setSummaries(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to update monthly summary');
      console.error(err);
      setLoading(false);
    }
  };

  if (loading && !analyticsData) {
    return <div className="text-center p-5">Loading analytics data...</div>;
  }

  if (error) {
    return <div className="text-center p-5 text-red-500">{error}</div>;
  }

  // Prepare application status data for pie chart
  const applicationStatusData = {
    labels: ['Pending', 'Interviews', 'Offers', 'Rejections', 'Withdrawn'],
    datasets: [
      {
        label: 'Application Status',
        data: analyticsData ? [
          analyticsData.applicationStats.pending,
          analyticsData.applicationStats.interviews,
          analyticsData.applicationStats.offers,
          analyticsData.applicationStats.rejections,
          analyticsData.applicationStats.withdrawn
        ] : [0, 0, 0, 0, 0],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(153, 102, 255, 0.6)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare summary data for bar chart
  const summaryChartData = {
    labels: summaries.map(summary => {
      const date = new Date(summary.week || summary.month);
      return summaryPeriod === 'weekly' 
        ? `Week of ${date.toLocaleDateString()}`
        : `${date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
    }),
    datasets: [
      {
        label: 'Applications',
        data: summaries.map(summary => summary.applicationsSubmitted),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Interviews',
        data: summaries.map(summary => summary.interviews),
        backgroundColor: 'rgba(255, 206, 86, 0.6)',
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 1,
      },
      {
        label: 'Offers',
        data: summaries.map(summary => summary.offers),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Rejections',
        data: summaries.map(summary => summary.rejections),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      }
    ],
  };

  // Prepare match rate data for line chart
  const matchRateChartData = {
    labels: summaries.map(summary => {
      const date = new Date(summary.week || summary.month);
      return summaryPeriod === 'weekly' 
        ? `Week of ${date.toLocaleDateString()}`
        : `${date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
    }),
    datasets: [
      {
        label: 'Average Match Rate (%)',
        data: summaries.map(summary => summary.averageMatchRate),
        fill: false,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1
      }
    ],
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">User Analytics Dashboard</h1>
      
      <DashboardTabs>
        <div>
          {/* Overview Statistics Cards */}
          <StatisticsCards analyticsData={analyticsData} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Application Status</h2>
          <div className="h-64">
            <Pie data={applicationStatusData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Application Summary</h2>
          <div className="flex justify-between mb-4">
            <div>
              <select 
                className="border rounded p-2"
                value={summaryPeriod}
                onChange={(e) => setSummaryPeriod(e.target.value)}
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <button 
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                onClick={summaryPeriod === 'weekly' ? updateWeeklySummary : updateMonthlySummary}
              >
                Update {summaryPeriod === 'weekly' ? 'Weekly' : 'Monthly'} Summary
              </button>
            </div>
          </div>
          <div className="h-64">
            <Bar data={summaryChartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* Match Rate Chart */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Job Match Rate Trend</h2>
        <div className="h-64">
          <Line data={matchRateChartData} options={{ maintainAspectRatio: false }} />
        </div>
      </div>

      {/* Response Time Chart */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Application Response Times</h2>
        <ResponseTimeChart />
      </div>

      {/* Job Match Chart */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Job Match Analysis</h2>
        <JobMatchChart />
      </div>

      {/* Suggestions Section */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Personalized Suggestions</h2>
          <button 
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={generateInsights}
          >
            Generate New Insights
          </button>
        </div>
        
        <SuggestionsList 
          suggestions={suggestions} 
          onMarkAsRead={markSuggestionAsRead} 
        />
      </div>
        </div>
      </DashboardTabs>
    </div>
  );
};

export default AnalyticsDashboard;