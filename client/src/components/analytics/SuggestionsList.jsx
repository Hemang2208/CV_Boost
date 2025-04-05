import { useState } from 'react';

const SuggestionsList = ({ suggestions, onMarkAsRead }) => {
  const [expandedSuggestion, setExpandedSuggestion] = useState(null);

  const toggleExpand = (id) => {
    setExpandedSuggestion(expandedSuggestion === id ? null : id);
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Skills':
        return 'bg-blue-100 text-blue-800';
      case 'JobCategory':
        return 'bg-green-100 text-green-800';
      case 'ResumeOptimization':
        return 'bg-purple-100 text-purple-800';
      case 'ApplicationStrategy':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="text-center p-5 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No suggestions available. Generate insights to get personalized suggestions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {suggestions.map((suggestion) => (
        <div key={suggestion._id} className="border p-4 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow duration-200">
          <div className="flex justify-between items-center">
            <span className={`inline-block ${getCategoryColor(suggestion.category)} px-3 py-1 rounded-full text-sm font-medium`}>
              {suggestion.category}
            </span>
            <div className="flex space-x-2">
              <button 
                className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                onClick={() => toggleExpand(suggestion._id)}
              >
                {expandedSuggestion === suggestion._id ? 'Collapse' : 'Expand'}
              </button>
              <button 
                className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                onClick={() => onMarkAsRead(suggestion._id)}
              >
                Mark as read
              </button>
            </div>
          </div>
          
          <div className={`mt-3 ${expandedSuggestion === suggestion._id ? '' : 'line-clamp-2'}`}>
            <p>{suggestion.content}</p>
          </div>
          
          <div className="mt-3 flex justify-between items-center text-sm text-gray-500">
            <span>{new Date(suggestion.date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}</span>
            {suggestion.isRead && <span className="text-green-500">Read</span>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SuggestionsList;