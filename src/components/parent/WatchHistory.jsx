import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

export default function WatchHistory({ profileId }) {
  const [watches, setWatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadHistory();
  }, [profileId]);

  const loadHistory = async () => {
    try {
      const response = await api.getHistory(profileId);
      setWatches(response.watches.reverse()); // Show most recent first
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-600">Loading watch history...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Watch History</h2>

      {watches.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No watch history yet.</p>
          <p className="text-sm text-gray-500 mt-2">Videos watched will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {watches.map((watch, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{watch.title}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Watched {new Date(watch.watchedAt).toLocaleString()}
                </p>
              </div>
              <div className="text-right text-sm text-gray-600">
                {watch.watchDuration ? formatDuration(watch.watchDuration) : 'Duration unknown'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}
