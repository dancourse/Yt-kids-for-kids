import { useState, useEffect } from 'react';
import { getProfiles, initializeStorage } from '../../lib/storage';
import { APP_VERSION } from '../../lib/constants';
import ProfileManager from './ProfileManager';

export default function Dashboard() {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = () => {
    try {
      initializeStorage();
      const loadedProfiles = getProfiles();
      setProfiles(loadedProfiles);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (selectedProfile) {
    return (
      <ProfileManager
        profile={selectedProfile}
        onBack={() => setSelectedProfile(null)}
        onUpdate={loadProfiles}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow relative">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">KiddoTube Parent Dashboard</h1>
          <div className="absolute top-2 right-4 text-xs text-gray-400">v{APP_VERSION}</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer"
              onClick={() => setSelectedProfile(profile)}
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="text-6xl">{profile.avatarId ? getAvatarEmoji(profile.avatarId) : '👤'}</div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{profile.sillyName || 'Unnamed Profile'}</h2>
                  <p className="text-sm text-gray-500">{profile.id}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">Click to manage this profile</p>
              </div>
            </div>
          ))}
        </div>
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
