import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

export default function CreatorManager({ profileId }) {
  const [creators, setCreators] = useState([]);
  const [channelUrl, setChannelUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCreators();
  }, [profileId]);

  const loadCreators = async () => {
    try {
      const response = await api.getCreators(profileId);
      setCreators(response.creators);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCreator = async (e) => {
    e.preventDefault();
    setError('');
    setAdding(true);

    try {
      await api.addCreator(profileId, channelUrl);
      setChannelUrl('');
      await loadCreators();
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveCreator = async (channelId) => {
    if (!confirm('Remove this creator? Videos from this creator will no longer be approved.')) {
      return;
    }

    try {
      await api.removeCreator(profileId, channelId);
      await loadCreators();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-600">Loading creators...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Approved Creators</h2>

      <form onSubmit={handleAddCreator} className="mb-8">
        <label htmlFor="channelUrl" className="block text-sm font-medium text-gray-700 mb-2">
          Add YouTube Channel
        </label>
        <div className="flex gap-2">
          <input
            id="channelUrl"
            type="text"
            value={channelUrl}
            onChange={(e) => setChannelUrl(e.target.value)}
            placeholder="https://www.youtube.com/@ChannelName or channel URL"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
          <button
            type="submit"
            disabled={adding}
            className="px-6 py-2 bg-primary hover:bg-purple-600 text-white font-semibold rounded-lg transition disabled:opacity-50"
          >
            {adding ? 'Adding...' : 'Add'}
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          All videos from approved creators will be available to watch.
        </p>
      </form>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {creators.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No approved creators yet.</p>
          <p className="text-sm text-gray-500 mt-2">Add a YouTube channel to get started.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {creators.map((creator) => (
            <div key={creator.channelId} className="border border-gray-200 rounded-lg p-4 flex items-start space-x-4">
              {creator.channelThumbnail && (
                <img
                  src={creator.channelThumbnail}
                  alt={creator.channelName}
                  className="w-16 h-16 rounded-full"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{creator.channelName}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Added {new Date(creator.addedAt).toLocaleDateString()}
                </p>
                {creator.approveAllVideos && (
                  <span className="inline-block mt-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    All videos approved
                  </span>
                )}
              </div>
              <button
                onClick={() => handleRemoveCreator(creator.channelId)}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
