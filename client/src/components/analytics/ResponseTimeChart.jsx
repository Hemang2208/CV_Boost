import { useState, useEffect, useCallback } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';

const ResponseTimeChart = () => {
  const [responseTimeData, setResponseTimeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoize the fetch function to prevent unnecessary re-renders
  const fetchResponseTimeData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/analytics/response-time');
      setResponseTimeData(response.data);
    } catch (err) {
      console.error('Error fetching response time data:', err.message);
      setError(
        err.response?.data?.msg || 
        'Failed to load response time data. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResponseTimeData();
  }, [fetchResponseTimeData]);

  if (loading) {
    return <div className="text-center p-3">Loading response time data...</div>;
  }

  if (error) {
    return <div className="text-center p-3 text-red-500">{error}</div>;
  }

  if (responseTimeData.length === 0) {
    return <div className="text-center p-3">No response time data available yet.</div>;
  }

  // Group response times by status
  const statusGroups = {};
  responseTimeData.forEach(item => {
    if (!statusGroups[item.status]) {
      statusGroups[item.status] = [];
    }
    statusGroups[item.status].push(item.responseTime);
  });

  // Calculate average response time for each status
  const statuses = Object.keys(statusGroups);
  const averageResponseTimes = statuses.map(status => {
    const times = statusGroups[status];
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  });

  // Prepare chart data
  const chartData = {
    labels: statuses.map(status => `${status} Response`),
    datasets: [
      {
        label: 'Average Response Time (days)',
        data: averageResponseTimes,
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Days'
        }
      }
    },
    plugins: {
      title: {
        display: true,
        text: 'Average Response Time by Application Status',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.raw.toFixed(1)} days`;
          }
        }
      }
    },
    maintainAspectRatio: false
  };

  return (
    <div className="h-64">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default ResponseTimeChart;