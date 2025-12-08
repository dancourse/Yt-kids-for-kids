import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

export default function VideoManager({ profileId }) {
  const [videos, setVideos] = useState([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadVideos();
  }, [profileId]);

  const loadVideos = async () => {
    try {
      const response = await api.getVideos(profileId);
      setVideos(response.videos);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVideo = async (e) => {
    e.preventDefault();
    setError('');
    setAdding(true);

    try {
      await api.addVideo(profileId, videoUrl);
      setVideoUrl('');
      await loadVideos();
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveVideo = async (videoId) => {
    if (!confirm('Remove this video from approved list?')) {
      return;
    }

    try {
      await api.removeVideo(profileId, videoId);
      await loadVideos();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBlockVideo = async (videoId) => {
    const reason = prompt('Reason for blocking (optional):');
    if (reason === null) return; // Cancelled

    try {
      await api.blockVideo(profileId, videoId, reason);
      await loadVideos();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-600">Loading videos...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Approved Videos</h2>

      <form onSubmit={handleAddVideo} className="mb-8">
        <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-2">
          Add Individual Video
        </label>
        <div className="flex gap-2">
          <input
            id="videoUrl"
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
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
      </form>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {videos.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No approved videos yet.</p>
          <p className="text-sm text-gray-500 mt-2">Add creators or individual videos to get started.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => (
            <div key={video.videoId} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full aspect-video object-cover"
              />
              <div className="p-3">
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
                  {video.title}
                </h3>
                <p className="text-xs text-gray-500 mb-2">{video.channelName}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBlockVideo(video.videoId)}
                    className="flex-1 text-xs px-3 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded transition"
                  >
                    Block
                  </button>
                  <button
                    onClick={() => handleRemoveVideo(video.videoId)}
                    className="flex-1 text-xs px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
