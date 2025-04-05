import { useState, useEffect, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';

const JobMatchChart = () => {
  const [jobMatchData, setJobMatchData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoize the fetch function to prevent unnecessary re-renders
  const fetchJobMatchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/analytics/job-match-data');
      setJobMatchData(response.data);
    } catch (err) {
      console.error('Error fetching job match data:', err.message);
      setError(
        err.response?.data?.msg || 
        'Failed to load job match data. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobMatchData();
  }, [fetchJobMatchData]);

  if (loading) {
    return <div className="text-center p-3">Loading job match data...</div>;
  }

  if (error) {
    return <div className="text-center p-3 text-red-500">{error}</div>;
  }

  if (jobMatchData.length === 0) {
    return <div className="text-center p-3">No job match data available yet.</div>;
  }

  // Sort data by date
  const sortedData = [...jobMatchData].sort((a, b) => new Date(a.date) - new Date(b.date));

  // Prepare chart data
  const chartData = {
    labels: sortedData.map(item => new Date(item.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Job Match Percentage',
        data: sortedData.map(item => item.matchPercentage),
        fill: false,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1
      }
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Match Percentage (%)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      }
    },
    plugins: {
      title: {
        display: true,
        text: 'Job Match Percentage Over Time',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.raw}% match`;
          }
        }
      }
    },
    maintainAspectRatio: false
  };

  return (
    <div className="h-64">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default JobMatchChart;