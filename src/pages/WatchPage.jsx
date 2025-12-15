import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { APP_VERSION } from '../lib/constants';
import { api } from '../lib/api';
import VideoCard from '../components/kids/VideoCard';
import VideoPlayer from '../components/kids/VideoPlayer';

export default function WatchPage() {
  const { profileId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
    loadVideos();
  }, [profileId]);

  const loadProfile = async () => {
    try {
      const profileData = await api.getProfile(profileId);
      if (profileData) {
        setProfile(profileData);
      } else {
        setError('Profile not found');
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError(err.message || 'Failed to load profile');
    }
  };

  const loadVideos = async () => {
    setLoading(true);
    try {
      const [videosData, creatorsData] = await Promise.all([
        api.getVideos(profileId),
        api.getCreators(profileId),
      ]);

      // Get individually approved videos
      const approvedVideos = videosData?.approvedVideos || [];
      const blockedVideoIds = new Set((videosData?.blockedVideos || []).map(v => v.videoId));

      // Fetch videos from all approved creators
      const creatorVideos = [];
      const creators = creatorsData?.creators || [];

      for (const creator of creators) {
        try {
          const response = await fetch(`/api/youtube-creator-videos?channelId=${creator.channelId}`);
          if (response.ok) {
            const data = await response.json();
            creatorVideos.push(...(data.videos || []));
          }
        } catch (err) {
          console.error(`Failed to load videos for creator ${creator.channelTitle}:`, err);
        }
      }

      // Merge and deduplicate videos
      const allVideosMap = new Map();

      // Add individually approved videos first (higher priority)
      approvedVideos.forEach(video => {
        if (!blockedVideoIds.has(video.videoId)) {
          allVideosMap.set(video.videoId, video);
        }
      });

      // Add creator videos
      creatorVideos.forEach(video => {
        if (!blockedVideoIds.has(video.videoId) && !allVideosMap.has(video.videoId)) {
          allVideosMap.set(video.videoId, video);
        }
      });

      setVideos(Array.from(allVideosMap.values()));
    } catch (err) {
      console.error('Failed to load videos:', err);
      setError(err.message || 'Failed to load videos');
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
  };

  const handleBackFromPlayer = () => {
    setSelectedVideo(null);
  };

  const handleWatchComplete = async (videoId, watchDuration, title) => {
    try {
      await api.recordWatch(profileId, videoId, title, watchDuration);
    } catch (err) {
      console.error('Failed to record watch history:', err);
    }
  };

  const handleSwitchProfile = () => {
    navigate('/');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-primary text-white rounded-full font-bold hover:bg-purple-600 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-2xl font-bold text-primary">Loading...</p>
      </div>
    );
  }

  if (selectedVideo) {
    return (
      <VideoPlayer
        video={selectedVideo}
        onBack={handleBackFromPlayer}
        onWatchComplete={handleWatchComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50 to-pink-50">
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-xs text-gray-400 absolute top-1 right-2">v{APP_VERSION}</div>
          <div className="flex items-center space-x-4">
            <div className="text-4xl">{getAvatarEmoji(profile.avatarId)}</div>
            <div>
              <h1 className="text-2xl font-bold text-primary">KiddoTube</h1>
              <p className="text-sm text-gray-600">{profile.sillyName}</p>
            </div>
          </div>
          <button
            onClick={handleSwitchProfile}
            className="px-4 py-2 bg-secondary hover:bg-yellow-500 text-gray-800 font-bold rounded-full transition"
          >
            Switch Profile
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-2xl font-bold text-primary">Loading videos...</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-3xl font-bold text-gray-700 mb-4">No videos yet!</p>
            <p className="text-xl text-gray-600 mb-6">Ask a parent to add some videos for you.</p>
            <button
              onClick={() => navigate('/parent')}
              className="px-6 py-3 bg-primary text-white rounded-full font-bold hover:bg-purple-600 transition"
            >
              Go to Parent Dashboard
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {videos.map((video) => (
              <VideoCard
                key={video.videoId}
                video={video}
                onClick={() => handleVideoClick(video)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function getAvatarEmoji(avatarId) {
  const avatars = {
    rocket: '🚀',
    dinosaur: '🦕',
    rainbow: '🌈',
    robot: '🤖',
    unicorn: '🦄',
    astronaut: '👨‍🚀',
    dragon: '🐉',
    penguin: '🐧',
  };
  return avatars[avatarId] || '👤';
}
